<?php

ini_set('display_errors', '0');

header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://ilyagrshn.com',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Vary: Origin');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400');

define('INIT_DATA_MAX_AGE', 86400);
define('TEXT_MAX_LENGTH', 512);
define('RATE_LIMIT_WINDOW', 3600);
define('RATE_LIMIT_MAX', 20);

function fail($status, $message)
{
    http_response_code($status);
    echo json_encode(['ok' => false, 'error' => $message]);
    exit;
}

function botToken()
{
    $token = getenv('BOT_API_KEY');
    if ($token) {
        return $token;
    }

    $envFile = __DIR__ . '/.env';
    if (!is_readable($envFile)) {
        return '';
    }

    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) {
            continue;
        }

        list($key, $value) = explode('=', $line, 2);
        if (trim($key) === 'BOT_API_KEY') {
            return trim(trim($value), "\"'");
        }
    }

    return '';
}

function userIdFromInitData($initData, $token)
{
    parse_str($initData, $fields);
    if (!isset($fields['hash'])) {
        return null;
    }

    $hash = $fields['hash'];
    unset($fields['hash']);
    ksort($fields);

    $pairs = [];
    foreach ($fields as $key => $value) {
        $pairs[] = $key . '=' . $value;
    }

    $secret = hash_hmac('sha256', $token, 'WebAppData', true);
    $expected = hash_hmac('sha256', implode("\n", $pairs), $secret);
    if (!hash_equals($expected, $hash)) {
        return null;
    }

    $authDate = (int) ($fields['auth_date'] ?? 0);
    if ($authDate <= 0 || time() - $authDate > INIT_DATA_MAX_AGE) {
        return null;
    }

    $user = json_decode($fields['user'] ?? '', true);
    return isset($user['id']) ? (int) $user['id'] : null;
}

function rateLimitRetryAfter($userId)
{
    $dir = sys_get_temp_dir() . '/shareApi';
    if (!is_dir($dir) && !mkdir($dir, 0700, true) && !is_dir($dir)) {
        return 0;
    }

    $handle = fopen($dir . '/' . $userId . '.json', 'c+');
    if (!$handle) {
        return 0;
    }

    flock($handle, LOCK_EX);

    $now = time();
    $stored = json_decode(stream_get_contents($handle), true);
    $recent = [];
    foreach (is_array($stored) ? $stored : [] as $stamp) {
        if ($now - (int) $stamp < RATE_LIMIT_WINDOW) {
            $recent[] = (int) $stamp;
        }
    }

    $exceeded = count($recent) >= RATE_LIMIT_MAX;
    if (!$exceeded) {
        $recent[] = $now;
    }

    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($recent));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);

    return $exceeded ? RATE_LIMIT_WINDOW - ($now - $recent[0]) : 0;
}

function callBotApi($token, $method, $request)
{
    $curl = curl_init('https://api.telegram.org/bot' . $token . '/' . $method);
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($request),
        CURLOPT_TIMEOUT => 10,
    ]);

    $response = curl_exec($curl);
    $error = curl_error($curl);

    if ($response === false) {
        $message = $error ?: 'Bot API request failed';
        fail(502, str_replace($token, 'BOT_API_KEY', $message));
    }

    return json_decode($response, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail(405, 'Use POST');
}

$token = botToken();
if (!$token) {
    fail(500, 'BOT_API_KEY is not configured');
}

$payload = json_decode(file_get_contents('php://input'), true);
$userId = userIdFromInitData($payload['initData'] ?? '', $token);
if (!$userId) {
    fail(403, 'initData is missing, expired or does not match the bot');
}

$retryAfter = rateLimitRetryAfter($userId);
if ($retryAfter > 0) {
    header('Retry-After: ' . $retryAfter);
    fail(429, 'Too many prepared messages, try again in ' . $retryAfter . 's');
}

$text = trim((string) ($payload['text'] ?? ''));
if ($text === '') {
    $text = 'Sent from the wallet mini app';
}
if (mb_strlen($text) > TEXT_MAX_LENGTH) {
    $text = mb_substr($text, 0, TEXT_MAX_LENGTH);
}

$prepared = callBotApi($token, 'savePreparedInlineMessage', [
    'user_id' => $userId,
    'result' => [
        'type' => 'article',
        'id' => bin2hex(random_bytes(8)),
        'title' => 'Wallet',
        'description' => $text,
        'input_message_content' => ['message_text' => $text],
    ],
    'allow_user_chats' => true,
    'allow_bot_chats' => false,
    'allow_group_chats' => true,
    'allow_channel_chats' => true,
]);

if (!($prepared['ok'] ?? false)) {
    fail(502, $prepared['description'] ?? 'savePreparedInlineMessage failed');
}

echo json_encode([
    'ok' => true,
    'id' => $prepared['result']['id'],
    'expires_at' => $prepared['result']['expiration_date'] ?? null,
]);
