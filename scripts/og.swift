// Renders share images and icons into public/v2/.
// Usage: swift scripts/og.swift
import AppKit

let root = URL(fileURLWithPath: CommandLine.arguments[0]).deletingLastPathComponent().deletingLastPathComponent()
let pub = root.appendingPathComponent("public/v2")

let bg = NSColor(srgbRed: 0x08 / 255, green: 0x09 / 255, blue: 0x0a / 255, alpha: 1)
let fg = NSColor(srgbRed: 0xf7 / 255, green: 0xf8 / 255, blue: 0xf8 / 255, alpha: 1)
let muted = NSColor(srgbRed: 0x8a / 255, green: 0x8f / 255, blue: 0x98 / 255, alpha: 1)
let line = NSColor(srgbRed: 0x1f / 255, green: 0x21 / 255, blue: 0x25 / 255, alpha: 1)

func render(width: Int, height: Int, to url: URL, draw: (CGContext) -> Void) {
    let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: width, pixelsHigh: height,
                               bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                               colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
    draw(NSGraphicsContext.current!.cgContext)
    NSGraphicsContext.restoreGraphicsState()
    try! rep.representation(using: .png, properties: [:])!.write(to: url)
    print("wrote", url.path)
}

func text(_ s: String, _ font: NSFont, _ color: NSColor, at p: CGPoint, kern: CGFloat = 0) {
    NSAttributedString(string: s, attributes: [.font: font, .foregroundColor: color, .kern: kern]).draw(at: p)
}

func font(_ size: CGFloat, _ weight: NSFont.Weight) -> NSFont { NSFont.systemFont(ofSize: size, weight: weight) }

let avatar = NSImage(contentsOf: pub.appendingPathComponent("avatar.png"))!
// Head-and-shoulders crop of the 496x496 avatar, in image coordinates (origin bottom-left).
let headCrop = CGRect(x: 110, y: 176, width: 280, height: 280)

/// Avatar on a white plate (the line art is black, so it needs a light background on dark surfaces).
func avatarPlate(in rect: CGRect, radius: CGFloat, crop: CGRect? = nil) {
    NSGraphicsContext.saveGraphicsState()
    let path = NSBezierPath(roundedRect: rect, xRadius: radius, yRadius: radius)
    NSColor.white.setFill(); path.fill(); path.addClip()
    avatar.draw(in: rect, from: crop ?? .zero, operation: .sourceOver, fraction: 1)
    NSGraphicsContext.restoreGraphicsState()
}

struct OG { let file: String; let role: String; let tagline: String; let lang: String }
let ogs = [
    OG(file: "og.png", role: "高级产品设计师 · 深圳", tagline: "关于生活、科技与阅读", lang: "中文 / EN"),
    OG(file: "og-en.png", role: "Senior Product Designer · Shenzhen", tagline: "On life, technology and reading", lang: "EN / 中文"),
]

for og in ogs {
    render(width: 1200, height: 630, to: pub.appendingPathComponent(og.file)) { ctx in
        bg.setFill(); CGRect(x: 0, y: 0, width: 1200, height: 630).fill()
        // soft glow
        let space = CGColorSpaceCreateDeviceRGB()
        let grad = CGGradient(colorsSpace: space, colors: [NSColor(srgbRed: 0.37, green: 0.42, blue: 0.82, alpha: 0.22).cgColor, NSColor.clear.cgColor] as CFArray, locations: [0, 1])!
        ctx.drawRadialGradient(grad, startCenter: CGPoint(x: 1050, y: 620), startRadius: 0, endCenter: CGPoint(x: 1050, y: 620), endRadius: 620, options: [])
        text("jefferyho.com", font(26, .medium), muted, at: CGPoint(x: 80, y: 508))
        avatarPlate(in: CGRect(x: 820, y: 210, width: 300, height: 300), radius: 150)
        text("Jeffery Ho", font(128, .semibold), fg, at: CGPoint(x: 72, y: 250), kern: -4)
        text(og.role, font(40, .regular), fg, at: CGPoint(x: 80, y: 190))
        line.setFill(); CGRect(x: 80, y: 130, width: 1040, height: 2).fill()
        text(og.tagline, font(28, .regular), muted, at: CGPoint(x: 80, y: 72))
        let l = NSAttributedString(string: og.lang, attributes: [.font: font(24, .medium), .foregroundColor: muted])
        l.draw(at: CGPoint(x: 1120 - l.size().width, y: 74))
    }
}

render(width: 180, height: 180, to: pub.appendingPathComponent("apple-touch-icon.png")) { _ in
    avatarPlate(in: CGRect(x: 0, y: 0, width: 180, height: 180), radius: 0, crop: headCrop)
}

render(width: 64, height: 64, to: pub.appendingPathComponent("favicon.png")) { _ in
    avatarPlate(in: CGRect(x: 0, y: 0, width: 64, height: 64), radius: 32, crop: headCrop)
}
