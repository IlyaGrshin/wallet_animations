// The viewer's "01 / Radial blue" preset, verbatim: MATERIALS[0] plus its
// DEFAULT_VARIANT_SETTINGS overrides, as served by dima.bio/cardsGRM.
export const CARD_COLOR = "#1a6ca2"

export const MATERIAL_VARIANT = 0

export const LIGHT_DIRECTION = [0.26, 0.19, 0.64]
export const LIGHT_POSITION = [0.1, 1.45, 6]

export const SCALAR_UNIFORMS = {
    uMaterialVariant: MATERIAL_VARIANT,
    uRadialFrequency: 1.4,
    uRadialDetail: 0.3,
    uRidgeDepth: 1,
    uRidgeFrequency: 1,
    uRidgeRadialSpecular: 0,
    uHeightMapDepth: -1,
    uHeightMapShade: 1,
    uFinishDetail: 1.65,
    uAnisotropy: 1,
    uLightType: 0,
    uLightIntensity: 5.9,
    uEnvironmentIntensity: 1.2,
    uRoughnessScale: 0.8,
    uExposure: 1,
    uMasterLighting: 1,
    uSpecularStrength: 1.55,
    uDiffuseStrength: 0.8,
    uEnvironmentSpecularStrength: 0.85,
    uAmbientDiffuseStrength: 0.7,
    uGrazingStrength: 0.75,
    uAppHighlightStrength: 0.7,
    uTypographyLightingStrength: 1,
    uQrLightingStrength: 0.95,
    uBlueSaturation: 1.08,
    uEdgeReflectionStrength: 2.5,
    uStudioFillStrength: 1,
    uStudioSoftboxStrength: 1,
    uEngravingDepth: 2,
    uAmbientDetailStrength: 0.5,
    uDetailLightStrength: 0.6,
    uDetailLightX: 0.12,
    uDetailLightY: -0.54,
    uDetailLightZ: 0.45,
    uDetailLightSoftness: 2.1,
    uPrintBrightness: 1,
    uPrintSpecularStrength: 1.15,
    uPrintBevelStrength: 0.95,
    uPrintContactStrength: 0,
    uPrintOpacity: 0.9,
    uQrRoughnessScale: 0.6,
    uQrReflectionStrength: 2.1,
    uQrEngravingStrength: 1,
}

export function hexToLinearRgb(hex) {
    return [1, 3, 5].map((offset) => {
        const srgb = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255
        return srgb <= 0.04045
            ? srgb / 12.92
            : ((srgb + 0.055) / 1.055) ** 2.4
    })
}
