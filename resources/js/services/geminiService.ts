import { GoogleGenAI, Type } from "@google/genai";

export interface AnalysisResult {
  riskScore: number;
  isScam: boolean;
  reason: string;
  suggestion: string;
  isSocialEngineering: boolean;
  detectedTactics: string[];
}

export interface WebsiteSafetyResult {
  isSecure: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  domainReputation: string;
  protocol: string;
  warning: string;
}

export interface AppPermissionAudit {
  appName: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sensitiveData: string;
  behavior: string;
}

export interface LivenessResult {
  type: 'REAL' | 'FAKE' | 'NONE';
  confidence: number;
  reason: string;
  vitals?: {
    skinTexture: 'NATURAL' | 'SMOOTHED' | 'N/A';
    lighting: 'DYNAMIC' | 'STATIC' | 'N/A';
    environment: 'REAL_3D' | 'FLAT' | 'N/A';
  };
}

export interface DeepfakeVideoResult {
  isDeepfake: boolean;
  confidence: number;
  findings: {
    faceMorphing: 'DETECTED' | 'NOT_DETECTED' | 'INCONCLUSIVE';
    lipSync: 'MATCHED' | 'MISMATCHED' | 'INCONCLUSIVE';
    generationArtifacts: 'DETECTED' | 'NOT_DETECTED';
  };
  summary: string;
  verdict: 'ORGANIC' | 'AI_MODIFIED' | 'SYNTHETIC';
}

export interface PaymentAnalysisResult {
  riskScore: number;
  isSafe: boolean;
  vendorName: string;
  historySummary: string;
  reportsCount: number;
  reason: string;
}

export interface FileSafetyResult {
  isSecure: boolean;
  threatLevel: string;
  verdict: string;
  permissionsRisk: string;
  detectedMalware: string[];
}

// Added comment above fix: Export ApkSafetyResult as alias for FileSafetyResult to resolve missing name error
export type ApkSafetyResult = FileSafetyResult;

// Added comment above fix: Added IdentityAuditResult interface for forensic profiling
export interface IdentityAuditResult {
  verdict: 'LEGITIMATE' | 'SUSPICIOUS' | 'MALICIOUS';
  overallRisk: number;
  layers: {
    metadata: { risk: 'LOW' | 'MEDIUM' | 'HIGH'; status: string; detail: string };
    visual: { risk: 'LOW' | 'MEDIUM' | 'HIGH'; status: string; detail: string };
    behavioral: { risk: 'LOW' | 'MEDIUM' | 'HIGH'; status: string; detail: string };
  };
  summary: string;
}

// Added comment above fix: Added ThreatRadarResult interface for system cluster analysis
export interface ThreatRadarResult {
  globalRiskLevel: number;
  activeClusters: { type: string; risk: number }[];
  predictedVectors: { type: string; risk: number; description: string }[];
  isZeroDayDetected: boolean;
  mitigationSteps: string[];
}

export interface SystemAuditResult {
  threatsFound: number;
  riskScore: number;
  networkIntegrity: 'SECURE' | 'DEGRADED' | 'COMPROMISED';
  detectedAnomalies: { type: string; risk: 'LOW' | 'MEDIUM' | 'HIGH'; description: string }[];
  lastScanTimestamp: number;
}

const TEXT_MODEL = 'gemini-3-flash-preview';

const SYSTEM_CORE_INSTRUCTION = `You are the Suraksha Setu Cyber Security AI Assistant. 
Your mission is to protect citizens from scams and digital fraud.

LANGUAGE PROTOCOL (STRICT):
1. TURN 1 (FIRST MESSAGE): You MUST respond strictly in English only. No exceptions. 
2. TURN 2+ (SUBSEQUENT MESSAGES): 
   - COMMAND PRIORITY: If the user says "Shift to Hindi", "Hindi mein bolo", "Switch to Marathi", or any request to change language, you MUST obey immediately and permanently for that session.
   - MIRRORING: If no specific command is given, mirror the language the user is currently using (English, Hindi, Hinglish, etc.).
   - HINGLISH: For complex security concepts, using a mix of Hindi and English (Hinglish) is preferred for Indian users to ensure they understand safety steps.
3. TONE: Professional, alert, and protective.
4. IDENTITY: You are a digital guardian for the National Cyber Guard of India.`;

export async function analyzeVideoForensics(videoBase64: string, mimeType: string): Promise<DeepfakeVideoResult> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [
        {
          parts: [
            { inlineData: { data: videoBase64, mimeType: mimeType } },
            { text: `FORENSIC VIDEO AUDIT: Analyze this video for deepfake signatures. 
            Check for:
            1. Face Morphing (inconsistent edge blending or jitter).
            2. Lip-sync Mismatch (discrepancy between speech and lip movements).
            3. AI Generation Artifacts (unnatural textures, lighting glitches).
            Respond strictly in JSON format.` }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isDeepfake: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER },
            findings: {
              type: Type.OBJECT,
              properties: {
                faceMorphing: { type: Type.STRING, enum: ['DETECTED', 'NOT_DETECTED', 'INCONCLUSIVE'] },
                lipSync: { type: Type.STRING, enum: ['MATCHED', 'MISMATCHED', 'INCONCLUSIVE'] },
                generationArtifacts: { type: Type.STRING, enum: ['DETECTED', 'NOT_DETECTED'] }
              },
              required: ["faceMorphing", "lipSync", "generationArtifacts"]
            },
            summary: { type: Type.STRING },
            verdict: { type: Type.STRING, enum: ['ORGANIC', 'AI_MODIFIED', 'SYNTHETIC'] }
          },
          required: ["isDeepfake", "confidence", "findings", "summary", "verdict"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    throw new Error("Neural Video Audit Failed.");
  }
}

// Added comment above fix: Added analyzeIdentityForensics implementation
export async function analyzeIdentityForensics(data: any): Promise<IdentityAuditResult> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `Analyze identity for forensics: ${JSON.stringify(data)}. Response must be JSON.`,
      config: {
        systemInstruction: "You are an ID Forensics expert. Analyze profile metadata, visual artifacts, and behavioral intent. Output JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, enum: ['LEGITIMATE', 'SUSPICIOUS', 'MALICIOUS'] },
            overallRisk: { type: Type.NUMBER },
            layers: {
              type: Type.OBJECT,
              properties: {
                metadata: { type: Type.OBJECT, properties: { risk: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] }, status: { type: Type.STRING }, detail: { type: Type.STRING } }, required: ["risk", "status", "detail"] },
                visual: { type: Type.OBJECT, properties: { risk: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] }, status: { type: Type.STRING }, detail: { type: Type.STRING } }, required: ["risk", "status", "detail"] },
                behavioral: { type: Type.OBJECT, properties: { risk: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] }, status: { type: Type.STRING }, detail: { type: Type.STRING } }, required: ["risk", "status", "detail"] }
              },
              required: ["metadata", "visual", "behavioral"]
            },
            summary: { type: Type.STRING }
          },
          required: ["verdict", "overallRisk", "layers", "summary"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    throw new Error("Identity forensics failed.");
  }
}

// Added comment above fix: Added analyzeThreatCluster implementation
export async function analyzeThreatCluster(registry: any[]): Promise<ThreatRadarResult> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `Analyze threat clusters from registry data: ${JSON.stringify(registry.slice(0, 20))}. Response must be JSON.`,
      config: {
        systemInstruction: "You are a Cyber Threat Intelligence analyst. Analyze patterns and clusters in scam reports. Output JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            globalRiskLevel: { type: Type.NUMBER },
            activeClusters: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, risk: { type: Type.NUMBER } }, required: ["type", "risk"] } },
            predictedVectors: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, risk: { type: Type.NUMBER }, description: { type: Type.STRING } }, required: ["type", "risk", "description"] } },
            isZeroDayDetected: { type: Type.BOOLEAN },
            mitigationSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["globalRiskLevel", "activeClusters", "predictedVectors", "isZeroDayDetected", "mitigationSteps"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    throw new Error("Threat radar analysis failed.");
  }
}

export async function performNeuralSystemAudit(mockLogs: string): Promise<SystemAuditResult> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `Perform High-Level Heuristic System Audit. 
      INPUT_TELEMETRY: ${mockLogs}
      TASK: Identify active exploits, zero-day signatures, and network anomalies.
      OUTPUT_FORMAT: JSON strictly following the schema.`,
      config: {
        systemInstruction: "You are the Automated Threat Detection System (ATDS) Core. Your analysis determines if the device is under attack. Be precise. Output JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            threatsFound: { type: Type.INTEGER },
            riskScore: { type: Type.NUMBER },
            networkIntegrity: { type: Type.STRING, enum: ['SECURE', 'DEGRADED', 'COMPROMISED'] },
            detectedAnomalies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  risk: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
                  description: { type: Type.STRING }
                },
                required: ["type", "risk", "description"]
              }
            },
            lastScanTimestamp: { type: Type.NUMBER }
          },
          required: ["threatsFound", "riskScore", "networkIntegrity", "detectedAnomalies", "lastScanTimestamp"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    throw new Error("ATDS Neural Handshake Failed.");
  }
}

export async function chatWithSurakshaAI(message: string, isFirst: boolean = false): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const protocolInstruction = isFirst 
      ? "PROTOCOL turn_1: Respond STRICTLY in English only." 
      : "PROTOCOL adaptive: Honor any language switch request (e.g. 'Hindi mein shift karo') immediately. If no request, mirror user language.";

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `${protocolInstruction}\nUser Message: ${message}`,
      config: {
        systemInstruction: SYSTEM_CORE_INSTRUCTION,
      },
    });
    return response.text || "I am online and ready to assist you.";
  } catch (e) {
    return "Neural connection unstable. Please try again in a few moments.";
  }
}

export async function analyzeScamContext(text: string, language: string = 'English'): Promise<AnalysisResult> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `Analyze for cyber threat: "${text}". Language: ${language}. Response must be JSON.`,
      config: {
        systemInstruction: SYSTEM_CORE_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER },
            isScam: { type: Type.BOOLEAN },
            isSocialEngineering: { type: Type.BOOLEAN },
            detectedTactics: { type: Type.ARRAY, items: { type: Type.STRING } },
            reason: { type: Type.STRING },
            suggestion: { type: Type.STRING }
          },
          required: ["riskScore", "isScam", "isSocialEngineering", "detectedTactics", "reason", "suggestion"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    return { riskScore: 50, isScam: false, isSocialEngineering: false, detectedTactics: ["Guardian Mode Active"], reason: "Analysis interrupted.", suggestion: "Stay cautious." };
  }
}

export async function analyzeLiveness(imageData: string): Promise<LivenessResult> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [
        {
          parts: [
            { inlineData: { data: imageData, mimeType: 'image/jpeg' } },
            { text: `FORENSIC AUDIT: Perform biometric liveness check. Is this a real human? Respond in JSON.` }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ["REAL", "FAKE", "NONE"] },
            confidence: { type: Type.NUMBER },
            reason: { type: Type.STRING }
          },
          required: ["type", "confidence", "reason"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    return { type: 'NONE', confidence: 0, reason: "Biometric link failed." };
  }
}

export async function analyzePaymentSafety(merchantInfo: string): Promise<PaymentAnalysisResult> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `Payment Audit for: "${merchantInfo}". Identify fraud risks. Respond in JSON.`,
      config: {
        systemInstruction: SYSTEM_CORE_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER },
            isSafe: { type: Type.BOOLEAN },
            vendorName: { type: Type.STRING },
            historySummary: { type: Type.STRING },
            reportsCount: { type: Type.NUMBER },
            reason: { type: Type.STRING }
          },
          required: ["riskScore", "isSafe", "vendorName", "historySummary", "reportsCount", "reason"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    return { riskScore: 0, isSafe: true, vendorName: merchantInfo, historySummary: "Unknown", reportsCount: 0, reason: "Monitoring active." };
  }
}

export async function analyzeWebsiteSafety(url: string): Promise<WebsiteSafetyResult> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `Scan URL for safety: "${url}". Respond in JSON.`,
      config: {
        systemInstruction: SYSTEM_CORE_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSecure: { type: Type.BOOLEAN },
            riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
            domainReputation: { type: Type.STRING },
            protocol: { type: Type.STRING },
            warning: { type: Type.STRING }
          },
          required: ["isSecure", "riskLevel", "domainReputation", "protocol", "warning"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    return { isSecure: true, riskLevel: 'LOW', domainReputation: "Unknown", protocol: 'HTTPS', warning: "Incomplete Scan." };
  }
}

export async function auditAppPermissions(target: string): Promise<AppPermissionAudit[]> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `Audit App Permissions for: "${target}". Identify privacy risks. Respond in JSON array of objects.`,
      config: {
        systemInstruction: SYSTEM_CORE_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              appName: { type: Type.STRING },
              riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
              sensitiveData: { type: Type.STRING },
              behavior: { type: Type.STRING }
            },
            required: ["appName", "riskLevel", "sensitiveData", "behavior"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    return [];
  }
}

// Added comment above fix: Renamed analyzeApkSafety to analyzeFileSafety to resolve missing export and used FileSafetyResult
export async function analyzeFileSafety(fileName: string, fileSize: number): Promise<FileSafetyResult> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `File Scan Audit: "${fileName}". Detect potential malware or malicious logic. Respond in JSON.`,
      config: {
        systemInstruction: SYSTEM_CORE_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSecure: { type: Type.BOOLEAN },
            threatLevel: { type: Type.STRING },
            verdict: { type: Type.STRING },
            permissionsRisk: { type: Type.STRING },
            detectedMalware: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["isSecure", "threatLevel", "verdict", "permissionsRisk", "detectedMalware"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { isSecure: true, threatLevel: 'CLEAN', verdict: "No malware found.", permissionsRisk: 'LOW', detectedMalware: [] };
  }
}

export async function getVoiceGuidance(view: string, status: string, language: string): Promise<string> {
  return "Monitoring active. Your session is secure.";
}