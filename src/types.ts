export type AssistantDepth = 'beginner' | 'intermediate' | 'advanced';

export type AppMode = 'chat' | 'pipeline' | 'doctor' | 'quiz';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface CompilerToken {
  lexeme: string;
  type: string;
  line: number;
  description: string;
}

export interface AstNode {
  nodeType: string;
  description: string;
}

export interface SymbolTableEntry {
  identifier: string;
  dataType: string;
  scope: string;
  attributes: string;
}

export interface OptimizationPass {
  passName: string;
  before: string;
  after: string;
  benefit: string;
}

export interface RegisterUsage {
  register: string;
  purpose: string;
}

export interface PipelineAnalysis {
  language: string;
  summary: string;
  lexicalAnalysis: {
    summary: string;
    tokens: CompilerToken[];
  };
  syntaxAnalysis: {
    summary: string;
    asciiAst: string;
    astNodes: AstNode[];
  };
  semanticAnalysis: {
    summary: string;
    symbolTable: SymbolTableEntry[];
    checks: string[];
  };
  intermediateRepresentation: {
    summary: string;
    irFormat: string;
    irCode: string;
    explanation: string[];
  };
  optimization: {
    summary: string;
    passesApplied: OptimizationPass[];
  };
  codeGeneration: {
    summary: string;
    architecture: string;
    assemblyCode: string;
    registerUsage: RegisterUsage[];
  };
}

export interface ErrorDiagnosis {
  title: string;
  category: string;
  compilerPhase: string;
  severity: string;
  plainEnglishExplanation: string;
  whyCompilerComplained: string;
  culpritLocation: {
    file: string;
    line: string;
    column: string;
    tokenOrSymbol: string;
  };
  suggestedFix: {
    explanation: string;
    originalSnippet: string;
    fixedSnippet: string;
  };
  pitfallsAndTips: string[];
}

export interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  codeExample?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  keyConcept: string;
}
