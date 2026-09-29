// MIME type check and Magic Numbers (File Signatures) verification
// To ensure uploaded files are genuine images/PDFs and prevent dangerous or executable files (.exe, .sh, .bat, etc.)

export interface ValidationResult {
  valid: boolean;
  detectedType?: string;
  error?: string;
}

const SIGNATURES: { [key: string]: { bytes: number[]; offset?: number; mime: string } } = {
  jpeg: { bytes: [0xFF, 0xD8, 0xFF], mime: 'image/jpeg' },
  png: { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], mime: 'image/png' },
  gif: { bytes: [0x47, 0x49, 0x46, 0x38], mime: 'image/gif' },
  bmp: { bytes: [0x42, 0x4D], mime: 'image/bmp' },
  pdf: { bytes: [0x25, 0x50, 0x44, 0x46], mime: 'application/pdf' }, // %PDF
  webp: { bytes: [0x52, 0x49, 0x46, 0x46], mime: 'image/webp' }, // RIFF....WEBP
};

// Executable signatures to explicitly ban
const DANGEROUS_SIGNATURES: { [key: string]: number[] } = {
  dos_mz: [0x4D, 0x5A], // MZ (DOS/Windows executable, EXE, DLL)
  elf: [0x7F, 0x45, 0x4C, 0x46], // ELF (Linux executable)
  mach_o: [0xFE, 0xED, 0xFA, 0xCE], // Mach-O 32
  mach_o_64: [0xFE, 0xED, 0xFA, 0xCF], // Mach-O 64
  script_shebang: [0x23, 0x21], // #! (scripts)
};

export async function validateSafeFile(file: File): Promise<ValidationResult> {
  // 1. Check basic size limits (e.g. 100MB client limit to prevent browser memory crashes)
  if (file.size > 100 * 1024 * 1024) {
    return { valid: false, error: '파일 크기가 너무 큽니다. (최대 100MB)' };
  }

  if (file.size < 4) {
    return { valid: false, error: '유효하지 않은 빈 파일입니다.' };
  }

  // 2. Read first 32 bytes for Magic Number verification
  const slice = file.slice(0, 32);
  const buffer = await slice.arrayBuffer();
  const header = new Uint8Array(buffer);

  // Check against dangerous executable signatures
  for (const [name, sig] of Object.entries(DANGEROUS_SIGNATURES)) {
    let match = true;
    for (let i = 0; i < sig.length; i++) {
      if (header[i] !== sig[i]) {
        match = false;
        break;
      }
    }
    if (match) {
      return { 
        valid: false, 
        error: `보안 위험: 실행 가능한 파일(${name}) 또는 비정상적인 파일 형식입니다. 처리가 차단되었습니다.` 
      };
    }
  }

  // Check if it's SVG (XML text)
  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    try {
      const text = new TextDecoder('utf-8').decode(header);
      if (text.includes('<svg') || text.includes('<?xml') || text.includes('<!DOCTYPE svg')) {
        return { valid: true, detectedType: 'image/svg+xml' };
      }
    } catch (e) {
      //
    }
  }

  // Check HEIC / HEIF (ftypheic or ftypmsf1 etc around offset 4)
  if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
    const text = new TextDecoder('ascii').decode(header.slice(4, 12));
    if (text.includes('ftyp') || text.includes('heic') || text.includes('mif1')) {
      return { valid: true, detectedType: 'image/heic' };
    }
  }

  // Check RIFF / WEBP
  if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46) {
    const webpHeader = new TextDecoder('ascii').decode(header.slice(8, 12));
    if (webpHeader === 'WEBP') {
      return { valid: true, detectedType: 'image/webp' };
    }
  }

  // Match known valid image/pdf formats
  for (const [key, sig] of Object.entries(SIGNATURES)) {
    if (key === 'webp') continue;
    let match = true;
    for (let i = 0; i < sig.bytes.length; i++) {
      if (header[i] !== sig.bytes[i]) {
        match = false;
        break;
      }
    }
    if (match) {
      return { valid: true, detectedType: sig.mime };
    }
  }

  // If MIME type provided by browser is valid image and file has image extension, allow if not flagged
  const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'application/pdf', 'image/svg+xml', 'image/heic'];
  if (validMimes.includes(file.type)) {
    return { valid: true, detectedType: file.type };
  }

  return {
    valid: false,
    error: '지원되지 않거나 손상된 파일 형식입니다. 유효한 이미지(JPG, PNG, WEBP, GIF, BMP, SVG, HEIC) 또는 PDF 파일만 업로드할 수 있습니다.'
  };
}
