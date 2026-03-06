import { QRCodeSVG } from 'qrcode.react';

interface Props { url: string; size?: number }

export default function QRCodeDisplay({ url, size = 140 }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white rounded-xl p-3 shadow-glow-sm border border-brand-500/20">
        <QRCodeSVG value={url} size={size} bgColor="#FFFFFF" fgColor="#0F0F1A" level="M" />
      </div>
      <p className="text-xs font-mono text-surface-500">scan to open</p>
    </div>
  );
}
