export interface CodePreset {
  id: string;
  name: string;
  language: string;
  description: string;
  code: string;
}

export interface ErrorPreset {
  id: string;
  name: string;
  compiler: string;
  errorLog: string;
  codeSnippet: string;
}

export const CODE_PRESETS: CodePreset[] = [
  {
    id: 'math-precedence',
    name: 'Arithmetic Precedence & Constant Folding',
    language: 'c',
    description: 'Demonstrates operator precedence in ASTs and constant folding optimization.',
    code: `int compute() {
    int a = 10 + 5 * 2;
    int b = a + 0;
    return b;
}`,
  },
  {
    id: 'while-loop',
    name: 'While Loop & Loop Invariant Code',
    language: 'c',
    description: 'Illustrates basic blocks, conditional branching, and loop optimization.',
    code: `int sum_to_n(int n) {
    int sum = 0;
    int i = 1;
    while (i <= n) {
        sum = sum + i;
        i = i + 1;
    }
    return sum;
}`,
  },
  {
    id: 'dead-code',
    name: 'Dead Code & Unreachable Branches',
    language: 'c',
    description: 'Shows how the optimizer prunes unreachable code and unused variables.',
    code: `int process_data(int flag) {
    int unused_var = 42;
    int result = 100;
    if (0) {
        result = 999;
    }
    return result * 2;
}`,
  },
  {
    id: 'function-call',
    name: 'Function Call & Stack Frames',
    language: 'c',
    description: 'Demonstrates calling conventions, parameter passing, and register preservation in assembly.',
    code: `int square(int x) {
    return x * x;
}

int calculate(int val) {
    int result = square(val) + 10;
    return result;
}`,
  },
  {
    id: 'rust-ownership',
    name: 'Rust Variable Binding & Expression',
    language: 'rust',
    description: 'Illustrates expression-based syntax and type checking.',
    code: `fn calculate_tax(income: f64) -> f64 {
    let rate = 0.20;
    let deduction = 5000.0;
    let taxable = if income > deduction { income - deduction } else { 0.0 };
    taxable * rate
}`,
  },
];

export const ERROR_PRESETS: ErrorPreset[] = [
  {
    id: 'c-discard-qualifiers',
    name: 'GCC / Clang: Discarding Const Qualifiers',
    compiler: 'gcc',
    errorLog: `test.c:8:14: warning: passing argument 1 of 'modify_string' discards 'const' qualifier from pointer target type [-Wdiscarded-qualifiers]
    8 |     modify_string(greeting);
      |                   ^~~~~~~~
test.c:3:26: note: expected 'char *' but argument is of type 'const char *'
    3 | void modify_string(char *s) {
      |                    ~~~~~~^`,
    codeSnippet: `#include <stdio.h>

void modify_string(char *s) {
    s[0] = 'H';
}

int main() {
    const char *greeting = "hello";
    modify_string(greeting);
    return 0;
}`,
  },
  {
    id: 'rust-borrow-checker',
    name: 'rustc: Borrow of Moved Value (E0382)',
    compiler: 'rustc',
    errorLog: `error[E0382]: borrow of moved value: \`data\`
  --> src/main.rs:7:20
   |
 4 |     let data = vec![1, 2, 3];
   |         ---- move occurs because \`data\` has type \`Vec<i32>\`, which does not implement the \`Copy\` trait
 5 |     consume(data);
   |             ---- value moved here
 6 |     
 7 |     println!("{:?}", data);
   |                      ^^^^ value borrowed here after move`,
    codeSnippet: `fn consume(items: Vec<i32>) {
    println!("Consumed {} items", items.len());
}

fn main() {
    let data = vec![1, 2, 3];
    consume(data);
    println!("{:?}", data);
}`,
  },
  {
    id: 'c-subscript-error',
    name: 'GCC: Subscripted value is neither array nor pointer',
    compiler: 'gcc',
    errorLog: `main.c: In function 'main':
main.c:5:16: error: subscripted value is neither array nor pointer nor vector
    5 |     int val = x[2];
      |                ^`,
    codeSnippet: `int main() {
    int x = 42;
    int val = x[2];
    return val;
}`,
  },
  {
    id: 'cpp-linker-vtable',
    name: 'g++ Linker: Undefined Reference to vtable',
    compiler: 'g++',
    errorLog: `/usr/bin/ld: /tmp/ccXyZ123.o: in function \`Shape::Shape()\`:
main.cpp:(.text._ZN5ShapeC2Ev[_ZN5ShapeC5Ev]+0x14): undefined reference to \`vtable for Shape\`
collect2: error: ld returned 1 exit status`,
    codeSnippet: `class Shape {
public:
    virtual void draw(); // declared but never defined!
    virtual ~Shape() = default;
};

int main() {
    Shape s;
    return 0;
}`,
  },
];

export const SUGGESTED_PROMPTS = [
  'How does a Lexer convert source characters into tokens?',
  'Explain the difference between LL(k) and LR(k) parsers.',
  'What is an Abstract Syntax Tree (AST) and how does it differ from a Parse Tree (CST)?',
  'What is Static Single Assignment (SSA) form and why does LLVM use it?',
  'Walk me through how a C compiler translates an "if-else" statement into assembly jump instructions.',
  'Explain register allocation using Graph Coloring.',
  'What is the difference between JIT (Just-In-Time) and AOT (Ahead-Of-Time) compilers?',
  'How does Constant Folding and Dead Code Elimination work?',
];

export const COMPILER_CHEATSHEET = [
  {
    phase: '1. Lexical Analysis (Scanner)',
    role: 'Converts raw source code characters into a stream of categorized tokens.',
    tools: 'Lex, Flex, Logos, Hand-written DFA scanners',
    keyConcepts: ['Regular Expressions', 'DFA & NFA', 'Lexemes & Tokens', 'Lookahead buffer'],
  },
  {
    phase: '2. Syntax Analysis (Parser)',
    role: 'Imposes grammatical hierarchy onto tokens to construct the Abstract Syntax Tree (AST).',
    tools: 'Yacc, Bison, ANTLR, Tree-sitter, Recursive Descent',
    keyConcepts: ['Context-Free Grammars (CFG)', 'Ambiguity resolution', 'Top-Down (LL)', 'Bottom-Up (LR/LALR/GLR)'],
  },
  {
    phase: '3. Semantic Analysis',
    role: 'Validates language rules that grammar alone cannot express (types, scopes, declarations).',
    tools: 'Symbol tables, Type checkers, Scope resolution passes',
    keyConcepts: ['Symbol Tables', 'Type Inference & Checking', 'Variable Scope', 'Type Coercion'],
  },
  {
    phase: '4. Intermediate Code Generation (IR)',
    role: 'Translates the AST into a machine-independent linear or graph-based representation.',
    tools: 'LLVM IR, GCC GIMPLE/RTL, Bytecode, Three-Address Code (TAC)',
    keyConcepts: ['Three-Address Code (TAC)', 'Control Flow Graphs (CFG)', 'Static Single Assignment (SSA)', 'Basic Blocks'],
  },
  {
    phase: '5. Machine-Independent Optimization',
    role: 'Transforms IR to improve execution speed, memory footprint, and power consumption.',
    tools: 'LLVM opt passes, GCC tree-ssa passes',
    keyConcepts: ['Constant Folding & Propagation', 'Dead Code Elimination (DCE)', 'Loop Invariant Code Motion (LICM)', 'Function Inlining'],
  },
  {
    phase: '6. Code Generation & Assembly',
    role: 'Emits target machine code (or assembly) with instruction selection and register mapping.',
    tools: 'LLVM llc, GCC backend, Asm generators',
    keyConcepts: ['Instruction Selection', 'Register Allocation (Graph Coloring)', 'Stack Frame Layout', 'Instruction Scheduling'],
  },
];
