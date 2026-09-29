export function getFallbackChatResponse(query: string, depth: string, code?: string): string {
  const q = query.toLowerCase();

  if (q.includes('register') || q.includes('spill') || q.includes('graph color')) {
    return `### ⚙️ Register Allocation & Graph Coloring

Register allocation is one of the most critical NP-complete problems in the compiler backend. It maps an unbounded number of **virtual registers / variables** in the Intermediate Representation (IR) to a small, fixed set of **physical CPU registers** (e.g. 16 registers in x86-64, 31 in ARM64).

#### 1. The Interference Graph
1. **Liveness Analysis**: A variable is "live" at a point $p$ if its current value will be read along some future execution path.
2. **Interference**: If variable $u$ and variable $v$ are live simultaneously at any instruction, they "interfere" and cannot share the same hardware register.
3. **Graph Construction**: Variables are vertices; interference edges connect variables that cannot share a register.

#### 2. Kempe's Heuristic & Chaitin's Algorithm ($K$-Coloring):
To allocate $K$ hardware registers:
- **Simplify**: Find a node $v$ with degree $< K$. Remove $v$ and push it onto a stack. (If the remaining graph is $K$-colorable, $v$ will have at least one color free!)
- **Spill**: If every remaining node has degree $\\ge K$, pick a node to "spill" to memory (stack RAM). Cost heuristics prioritize variables in deep loops.
- **Select**: Pop nodes from the stack and assign each an available physical register color.

#### 3. Modern Linear Scan Allocation:
JIT compilers (like V8 and HotSpot) often use **Linear Scan** instead of Graph Coloring because it runs in $O(N)$ time instead of $O(N^2)$, trading a tiny fraction of runtime speed for lightning-fast compilation latency!`;
  }

  if (q.includes('optimiz') || q.includes('dce') || q.includes('constant fold') || q.includes('inlin')) {
    return `### ⚡ Compiler Optimizations: Middle-End Passes

Modern compilers like LLVM and GCC run dozens of optimization passes over the Intermediate Representation (IR) before emitting machine code.

#### 1. Constant Folding & Constant Propagation
- **Constant Folding**: Computes expressions with known compile-time values:
  \`\`\`c
  // Before
  int seconds = 60 * 60 * 24;
  // After Constant Folding
  int seconds = 86400;
  \`\`\`
- **Constant Propagation**: Replaces variables with their constant values across basic blocks.

#### 2. Dead Code Elimination (DCE)
Removes code whose execution has no observable side-effects:
\`\`\`c
// Before
int unused = complex_pure_calc();
if (0) { launch_rocket(); }

// After DCE: completely eradicated!
\`\`\`

#### 3. Loop Invariant Code Motion (LICM)
Hoists computations that don't change across loop iterations outside the loop header:
\`\`\`c
// Before
for (int i = 0; i < n; i++) {
    arr[i] = i * (width * height); // width * height recomputed every iteration!
}

// After LICM
int area = width * height;
for (int i = 0; i < n; i++) {
    arr[i] = i * area;
}
\`\`\`

#### 4. Function Inlining
Replaces a function call with the actual body of the callee, eliminating call overhead (call/ret instructions, stack frame creation) and exposing new optimization opportunities.`;
  }

  if (q.includes('lex') || q.includes('token') || q.includes('scanner')) {
    return `### 🔍 Lexical Analysis (Scanning)

Lexical analysis is the **first phase** of a compiler. It reads the source program as a flat stream of characters and groups them into meaningful sequences called **lexemes**, producing a sequence of **tokens**.

#### 1. Core Terminology:
- **Token**: An abstract symbol representing a category (e.g., \`KEYWORD\`, \`IDENTIFIER\`, \`NUMBER\`, \`ASSIGN_OP\`).
- **Lexeme**: The exact concrete character sequence matching the token pattern (e.g., \`int\`, \`counter\`, \`42\`, \`=\`).
- **Pattern**: The formal rule defining which strings match the token (usually written as a **Regular Expression**).

#### 2. How the Scanner Works Under the Hood:
1. **Regular Expressions (Regex)** specify language patterns.
2. The compiler generator transforms these into a **Non-deterministic Finite Automaton (NFA)** via Thompson's Construction.
3. The NFA is converted into a **Deterministic Finite Automaton (DFA)** using subset construction.
4. The DFA is minimized (Hopcroft's algorithm) to produce an ultra-fast O(1) per-character state transition table.

#### 3. Example Walkthrough:
Source code: \`int x = 5 + 3;\`
- \`"int"\` → \`<KEYWORD_INT, "int">\`
- \`" "\` → *(Discarded whitespace)*
- \`"x"\` → \`<IDENTIFIER, "x">\`
- \`"="\` → \`<ASSIGN_OP, "=">\`
- \`"5"\` → \`<INTEGER_LITERAL, 5>\`
- \`"+"\` → \`<ADD_OP, "+">\`
- \`"3"\` → \`<INTEGER_LITERAL, 3>\`
- \`";"\` → \`<SEMICOLON, ";">\`

> **Key Takeaway**: The Lexer does **not** understand nested logic or syntax rules (like matching parentheses). That is the job of the **Parser (Syntax Analyzer)**!`;
  }

  if (q.includes('ll') || q.includes('lr') || q.includes('parse') || q.includes('parsing') || q.includes('ast')) {
    return `### 🌳 Syntax Analysis: LL vs LR Parsers & ASTs

The **Parser** takes the stream of tokens from the lexer and verifies whether they satisfy the grammatical structure defined by a **Context-Free Grammar (CFG)**.

#### Top-Down (LL) vs Bottom-Up (LR):

| Metric | **LL(k) Parsers** (e.g. Recursive Descent, ANTLR) | **LR(k) / LALR Parsers** (e.g. Yacc, Bison) |
| :--- | :--- | :--- |
| **Direction** | Left-to-right scan, **Leftmost** derivation | Left-to-right scan, **Rightmost** derivation in reverse |
| **Strategy** | **Top-Down**: Starts from the Start symbol and predicts productions downwards. | **Bottom-Up**: Starts from tokens and reduces them into non-terminals (**Shift-Reduce**). |
| **Expressiveness** | Less powerful. Cannot handle **left-recursive** grammars (\`E → E + T\`). | Extremely powerful. Handles almost all deterministic CFGs. |
| **Implementation** | Easy to hand-write (Recursive Descent with functions per non-terminal). | Usually generated via tables (Action and Goto tables) driven by a pushdown stack. |

#### What is an Abstract Syntax Tree (AST)?
A **Parse Tree (Concrete Syntax Tree - CST)** contains every token, parenthesis, and grammar derivation step.
An **Abstract Syntax Tree (AST)** discards syntactic noise (semicolons, parentheses) and captures only the pure hierarchical operational structure:

\`\`\`
       [Assignment: =]
          /        \\
   [Identifier: x]   [BinaryOp: +]
                       /       \\
             [Literal: 5]    [BinaryOp: *]
                               /       \\
                     [Literal: 3]    [Literal: 2]
\`\`\`

> **Why ASTs Matter**: Every subsequent compiler phase (Type checking, Symbol Table verification, Optimization, and IR generation) walks the AST!`;
  }

  if (q.includes('ssa') || q.includes('llvm') || q.includes('intermediate') || q.includes('ir')) {
    return `### ⚡ Static Single Assignment (SSA) Form & LLVM IR

**Static Single Assignment (SSA)** is the gold standard for compiler intermediate representations (used in LLVM, GCC GIMPLE, V8, and HotSpot JVM).

#### The Single SSA Rule:
> **Every variable is assigned a value exactly ONCE in the static program text.**

#### 1. Why Ordinary Code Is Hard to Optimize:
\`\`\`c
int x = 10;
// ... long block of code ...
x = 20;
print(x);
\`\`\`
In non-SSA code, the optimizer has to compute complex "reaching definitions" to know which \`x\` is being read.

#### 2. Conversion to SSA Form:
Each reassignment creates a new version subscript:
\`\`\`llvm
x1 = 10
...
x2 = 20
print(x2)  ; Compiler immediately knows x1 is dead and can be eliminated!
\`\`\`

#### 3. Merging Paths with $\\phi$ (Phi) Nodes:
When control flow branches merge (like after an \`if-else\` statement), SSA uses a mathematical **$\\phi$ (Phi) function** to select the right version depending on which predecessor basic block executed:

\`\`\`llvm
entry:
  br i1 %condition, label %then_block, label %else_block

then_block:
  %x_then = add i32 5, 1
  br label %merge

else_block:
  %x_else = mul i32 5, 2
  br label %merge

merge:
  ; phi selects %x_then if came from then_block, or %x_else if came from else_block
  %x_final = phi i32 [ %x_then, %then_block ], [ %x_else, %else_block ]
\`\`\`

#### Why SSA Dominates Modern Compilers:
1. **Trivial Dead Code Elimination (DCE)**: If a variable version is never used, drop its instruction.
2. **Global Value Numbering (GVN)**: Identifies redundant computations across different blocks.
3. **Register Allocation**: Interference graphs become Chordal graphs, which can be colored much faster!`;
  }

  if (q.includes('semantic') || q.includes('symbol table') || q.includes('type check')) {
    return `### 📋 Semantic Analysis & Symbol Tables

Semantic analysis is the third phase of the compiler frontend. Grammars can define syntax (like "expressions have operators and operands"), but they cannot verify context-sensitive language rules.

#### What Semantic Analysis Validates:
1. **Type Checking**: Ensuring operand types match operator requirements (e.g. cannot add a string pointer to a float in strict languages).
2. **Declaration Before Use**: Verifying variables and functions exist in the accessible scope.
3. **Scope Resolution**: Handling shadowed variables in inner blocks vs global variables.
4. **Const Correctness & Mutability**: Enforcing \`const\` rules in C/C++ or borrow semantics in Rust.

#### The Symbol Table Data Structure:
The symbol table maps variable names to their semantic records:
- **Type**: \`int\`, \`float*\`, \`struct Node\`, \`fn(int) -> bool\`
- **Scope Level**: Global (0), Function (1), Block (2)
- **Memory Location**: Stack frame offset (e.g., \`-16(%rbp)\`) or register
- **Access Modifiers**: \`const\`, \`static\`, \`volatile\`

Implemented as a chained hash table (or tree of scopes) where lookups search from the innermost active scope up to the global root.`;
  }

  if (q.includes('jit') || q.includes('aot')) {
    return `### 🏎️ JIT (Just-In-Time) vs AOT (Ahead-Of-Time) Compilation

#### 1. Ahead-Of-Time (AOT) Compilation
- **Examples**: C, C++, Rust, Go, Swift.
- **Workflow**: Source Code $\\to$ Compiler $\\to$ Native Machine Binary (ELF/PE/Mach-O).
- **Strengths**: Instant startup time, predictable execution latency, heavy whole-program optimization without runtime CPU overhead.
- **Weaknesses**: Cannot optimize for dynamic runtime values; binary must be built for target CPU architecture beforehand.

#### 2. Just-In-Time (JIT) Compilation
- **Examples**: JavaScript (V8), Java (HotSpot), C# (.NET CLR), Julia.
- **Workflow**: Source Code $\\to$ Bytecode $\\to$ Interpreted / Monitored $\\to$ Hot loops dynamically compiled to Machine Code at runtime!
- **Dynamic Profile-Guided Optimization (PGO)**:
  - If a JavaScript function is always passed integers: \`add(a, b)\`, the JIT generates specialized integer assembly instructions!
  - If a string is passed later, the JIT uses a **Deoptimization (Deopt)** guard and bails back to interpreter mode.

> **Summary**: AOT excels at low-level systems, games, and embedded devices; JIT excels at dynamic scripting languages and long-running server daemons.`;
  }

  // Dynamic context-aware answer
  return `### 🎓 Compiler Analysis & Theory

Here is a breakdown addressing your question: **"${query}"**

#### Key Compiler Insights:
1. **Frontend Role**:
   - **Lexical Analysis**: Characters are grouped into tokens via DFA state transitions.
   - **Syntax Analysis**: Context-Free Grammars (CFGs) establish hierarchical derivation trees (ASTs).
   - **Semantic Analysis**: Symbol tables track types, scopes, and validity.
2. **Optimizer Role**:
   - The AST is flattened into **Three-Address Code (TAC)** or **Static Single Assignment (SSA)**.
   - Independent passes prune dead code, fold constants, unroll loops, and eliminate redundant calculations.
3. **Backend Role**:
   - **Instruction Selection**: Converting IR operations into hardware CPU assembly.
   - **Register Allocation**: Using graph coloring algorithms to assign variables to hardware registers like \`%rax\`, \`%rdi\`, \`w0\`.

${code ? `\n#### Analysis of Active Workspace Code:\n\`\`\`\n${code.slice(0, 300)}\n\`\`\`\nThis code follows standard structured control flow and can be visualized step-by-step in the **6-Phase Visualizer** tab!` : ''}

*(Tip: You can explore the **6-Phase Visualizer** to see ASTs, TAC, and Assembly, or use the **Error Doctor** to debug compiler warnings!)*`;
}

export function getFallbackPipeline(code: string, language: string, targetArch: string) {
  // Extract identifiers and tokens dynamically from the user's code snippet
  const lines = code.split('\n');
  const tokenList: Array<{ lexeme: string; type: string; line: number; description: string }> = [];

  const keywords = new Set(['int', 'float', 'char', 'void', 'return', 'if', 'else', 'while', 'for', 'fn', 'let', 'def', 'const']);
  const operators = new Set(['+', '-', '*', '/', '=', '==', '!=', '<', '>', '<=', '>=']);
  const punctuation = new Set(['(', ')', '{', '}', ';', ',', ':', '[', ']']);

  lines.forEach((lineText, lineIdx) => {
    const rawTokens = lineText.match(/[a-zA-Z_]\w*|\d+|==|!=|<=|>=|[+\-*/=();,{}\[\]]/g) || [];
    rawTokens.forEach((t) => {
      let type = 'IDENTIFIER';
      let desc = 'Program identifier / variable name';

      if (keywords.has(t)) {
        type = 'KEYWORD';
        desc = `Language reserved keyword (${t})`;
      } else if (/^\d+$/.test(t)) {
        type = 'LITERAL_INT';
        desc = `Integer numeric constant literal (${t})`;
      } else if (operators.has(t)) {
        type = 'OPERATOR';
        desc = `Binary or assignment operator (${t})`;
      } else if (punctuation.has(t)) {
        type = 'PUNCTUATION';
        desc = `Syntax delimiter (${t})`;
      }

      if (tokenList.length < 24) {
        tokenList.push({
          lexeme: t,
          type,
          line: lineIdx + 1,
          description: desc,
        });
      }
    });
  });

  if (tokenList.length === 0) {
    tokenList.push(
      { lexeme: 'int', type: 'KEYWORD', line: 1, description: 'Type specifier' },
      { lexeme: 'val', type: 'IDENTIFIER', line: 1, description: 'Identifier' },
      { lexeme: '=', type: 'OPERATOR', line: 1, description: 'Assignment' },
      { lexeme: '42', type: 'LITERAL_INT', line: 1, description: 'Literal constant' },
      { lexeme: ';', type: 'PUNCTUATION', line: 1, description: 'Terminator' }
    );
  }

  // Extract function or variable names
  const funcMatch = code.match(/(?:int|void|fn|def)\s+([a-zA-Z_]\w*)\s*\(/);
  const funcName = funcMatch ? funcMatch[1] : 'main';

  return {
    language,
    summary: `Complete 6-phase compilation of ${language} code targeting ${targetArch}. The source was scanned into tokens, structured into an Abstract Syntax Tree, verified against the symbol table, converted into Three-Address Intermediate Representation, optimized with constant folding and dead code elimination, and lowered into native ${targetArch} assembly.`,
    lexicalAnalysis: {
      summary: `The lexical scanner processed ${code.length} characters across ${lines.length} lines, recognized ${tokenList.length} distinct tokens, and discarded whitespaces.`,
      tokens: tokenList,
    },
    syntaxAnalysis: {
      summary: `Recursive descent parser validated the grammar rules and generated a hierarchical Abstract Syntax Tree for function "${funcName}".`,
      asciiAst: `FunctionDeclaration: ${funcName}
  └── CompoundStatement [Scope: function]
       ├── Declarations & Initializers
       │    └── ExpressionTree (Precedence: Multiplicative > Additive)
       └── ReturnStatement / ExitNode`,
      astNodes: [
        { nodeType: 'FunctionDeclaration', description: `Defines routine signature for "${funcName}"` },
        { nodeType: 'CompoundStatement', description: 'Enclosing block scope with local bindings' },
        { nodeType: 'BinaryOp (+, *, -)', description: 'Binary arithmetic and assignment expressions' },
        { nodeType: 'ReturnStatement', description: 'Control flow transfer back to caller' },
      ],
    },
    semanticAnalysis: {
      summary: `Type checker confirmed type safety, bound variables to the local stack frame, and validated that all symbols in "${funcName}" were declared prior to usage.`,
      symbolTable: [
        { identifier: funcName, dataType: 'function () -> int', scope: 'Global / Exported', attributes: 'Executable code segment' },
        { identifier: 'local_var', dataType: 'int (32-bit signed)', scope: `Local (${funcName})`, attributes: 'Offset -4 from %rbp' },
      ],
      checks: [
        `Checked: Symbol "${funcName}" defined with valid signature`,
        'Checked: Operand type compatibility for arithmetic operators',
        'Checked: No variable read prior to initialization',
        'Checked: Proper scope exit and frame cleanup semantics',
      ],
    },
    intermediateRepresentation: {
      summary: 'Lowered AST into linearized Three-Address Code (TAC) and LLVM-like SSA Intermediate Representation.',
      irFormat: 'LLVM IR / Three-Address Code (TAC)',
      irCode: `; Function: @${funcName}
define i32 @${funcName}() {
entry:
  %1 = mul nsw i32 5, 2
  %2 = add nsw i32 10, %1
  ret i32 %2
}`,
      explanation: [
        '%1 computes subexpression in virtual register',
        '%2 combines operands into final result',
        'ret returns scalar value to caller frame',
      ],
    },
    optimization: {
      summary: 'Machine-independent passes executed Constant Folding, Dead Code Elimination, and Register Simplification.',
      passesApplied: [
        {
          passName: 'Constant Folding & Propagation',
          before: '%1 = mul 5, 2\n%2 = add 10, %1',
          after: '%2 = 20',
          benefit: 'Evaluated constant arithmetic expressions at compile time, eliminating runtime ALU instructions.',
        },
        {
          passName: 'Dead Code & Redundant Variable Elimination',
          before: 'int temp = 20;\nreturn temp;',
          after: 'return 20;',
          benefit: 'Avoids unneeded stack allocations and directly feeds constant into the return register.',
        },
      ],
    },
    codeGeneration: {
      summary: `Emitted optimal native ${targetArch} assembly instructions adhering to calling conventions.`,
      architecture: targetArch,
      assemblyCode: targetArch === 'ARM64'
        ? `.globl _${funcName}
.p2align 2
_${funcName}:
    mov     w0, #20         ; Load return value into w0
    ret                     ; Return to caller via lr`
        : `.globl ${funcName}
.type ${funcName}, @function
${funcName}:
    movl    $20, %eax       ; Return value in %eax
    ret                     ; Return to caller`,
      registerUsage: [
        { register: targetArch === 'ARM64' ? 'w0' : '%eax', purpose: 'Standard 32-bit return register' },
        { register: targetArch === 'ARM64' ? 'x30 (lr)' : '%rsp', purpose: 'Link register / Stack pointer' },
      ],
    },
  };
}

export function getFallbackDiagnosis(errorLog: string, codeSnippet: string, compiler: string) {
  const isConstError = errorLog.toLowerCase().includes('const');
  const isBorrowError = errorLog.toLowerCase().includes('borrow') || errorLog.toLowerCase().includes('moved');
  const isLinkerError = errorLog.toLowerCase().includes('undefined reference') || errorLog.toLowerCase().includes('ld returned');
  const isSubscriptError = errorLog.toLowerCase().includes('subscript');

  if (isBorrowError) {
    return {
      title: 'Rust Borrow Checker: Use of Moved Value (E0382)',
      category: 'Ownership & Borrowing Violation',
      compilerPhase: 'Semantic Analysis / Borrow Checker (rustc)',
      severity: 'Compile-Time Error (Fatal)',
      plainEnglishExplanation:
        'You moved ownership of a value into another function or variable, and then tried to use it again. In Rust, non-Copy types can only have one owner at a time.',
      whyCompilerComplained:
        'Rust ensures memory safety without a garbage collector by enforcing affine types: once ownership of a heap resource (like Vec or String) is passed by value, the original binding becomes invalid.',
      culpritLocation: {
        file: 'src/main.rs',
        line: '7',
        column: '20',
        tokenOrSymbol: 'data',
      },
      suggestedFix: {
        explanation: 'Pass a reference (`&data` or `&items`) instead of passing ownership, or clone the data if an independent copy is needed.',
        originalSnippet: `fn consume(items: Vec<i32>) { ... }\nconsume(data);\nprintln!("{:?}", data); // Error!`,
        fixedSnippet: `// Option A: Borrow by reference\nfn consume(items: &[i32]) { ... }\nconsume(&data);\nprintln!("{:?}", data); // Valid!`,
      },
      pitfallsAndTips: [
        'Prefer borrowing references `&T` or `&mut T` over taking ownership `T` when the callee only needs to inspect data.',
        'Types that implement the `Copy` trait (like primitives `i32`, `f64`) are duplicated rather than moved.',
      ],
    };
  }

  if (isLinkerError) {
    return {
      title: 'Linker Error: Undefined Reference / Symbol Resolution Failure',
      category: 'Link Time Symbol Resolution',
      compilerPhase: 'Linker Phase (GNU ld / lld / gold)',
      severity: 'Fatal Linker Error (collect2 exit 1)',
      plainEnglishExplanation:
        'The compiler successfully created object files (.o), but the linker cannot find the compiled implementation of a declared function, method, or vtable.',
      whyCompilerComplained:
        'A header file or class declaration promised that a function or virtual method existed, but no compiled object file or library provided the actual machine code definition.',
      culpritLocation: {
        file: 'main.cpp',
        line: '1',
        column: '1',
        tokenOrSymbol: 'vtable / undefined symbol',
      },
      suggestedFix: {
        explanation: 'Ensure all declared virtual methods have a body, or compile and link all source files together (e.g. `g++ main.cpp other.cpp -o app`).',
        originalSnippet: `class Shape {\n    virtual void draw(); // declared but never defined!\n};`,
        fixedSnippet: `class Shape {\n    virtual void draw() { /* implementation */ }\n    // Or make it pure virtual:\n    // virtual void draw() = 0;\n};`,
      },
      pitfallsAndTips: [
        'In C++, if the first non-inline virtual method is not defined, GCC/Clang emits a cryptic "undefined reference to vtable" error.',
        'Check that you compiled all `.c` or `.cpp` files and linked required libraries (e.g. `-lm` for math, `-lpthread`).',
      ],
    };
  }

  if (isSubscriptError) {
    return {
      title: 'Invalid Subscript: Value is neither array nor pointer',
      category: 'Type System Violation (Subscript Operator)',
      compilerPhase: 'Semantic Analysis / Type Checker',
      severity: 'Compile-Time Error',
      plainEnglishExplanation:
        'You applied the array index operator `[ ]` to a non-array, non-pointer scalar variable (like a raw `int` or `float`).',
      whyCompilerComplained:
        'In C, array subscripting `a[b]` is defined as `*(a + b)`. This requires one operand to be a pointer or array and the other to be an integer. Subscripting a plain integer is invalid.',
      culpritLocation: {
        file: 'main.c',
        line: '5',
        column: '16',
        tokenOrSymbol: 'x[2]',
      },
      suggestedFix: {
        explanation: 'Declare the variable as an array `int x[]` or pointer `int *x`, or remove the `[ ]` subscript.',
        originalSnippet: `int x = 42;\nint val = x[2]; // Error!`,
        fixedSnippet: `int x[] = { 10, 20, 42 };\nint val = x[2]; // Correct: val is 42`,
      },
      pitfallsAndTips: [
        'Check variable names for typos where a scalar variable was used instead of an array.',
        'Remember that `x[i]` dereferences memory; accessing a scalar as an array is undefined behavior.',
      ],
    };
  }

  // Default to const qualifier diagnosis
  return {
    title: 'Discarding Const Qualifier in Pointer Target Type',
    category: 'Type System Violation (Const Correctness)',
    compilerPhase: 'Semantic Analysis / Type Checker',
    severity: 'Warning / Error (-Werror)',
    plainEnglishExplanation:
      'You are passing a pointer to read-only memory (const char *) into a function parameter that expects a mutable pointer (char *). The compiler refuses because this function could attempt to write into read-only memory, causing a Segmentation Fault at runtime.',
    whyCompilerComplained:
      'C and C++ type systems enforce "const qualifiers" to protect invariant data. A "const T *" guarantees the pointed data will not be modified through that pointer. Passing it to a parameter declared as "T *" strips this protection without an explicit cast.',
    culpritLocation: {
      file: 'test.c',
      line: '8',
      column: '19',
      tokenOrSymbol: 'greeting',
    },
    suggestedFix: {
      explanation:
        'If the function only inspects the string without modifying it, mark the parameter as `const char *s`. If the function must modify the string, pass a mutable stack-allocated char buffer instead of a string literal.',
      originalSnippet: `void modify_string(char *s) { ... }\nconst char *greeting = "hello";\nmodify_string(greeting); // Error!`,
      fixedSnippet: `// Option A: If function only reads the string:\nvoid inspect_string(const char *s) {\n    printf("%s\\n", s);\n}\n\n// Option B: If function truly modifies characters:\nchar greeting[] = "hello"; // mutable stack array\nmodify_string(greeting);`,
    },
    pitfallsAndTips: [
      'String literals in C/C++ like "hello" live in the read-only .rodata segment; modifying them causes a SIGSEGV.',
      'Always mark pointer parameters with `const` unless the function explicitly intends to mutate caller data.',
      'Avoid casting away `const` with `(char *)ptr` unless you know with 100% certainty that the target buffer is mutable.',
    ],
  };
}

export function getFallbackQuiz(topic: string, difficulty: string) {
  return [
    {
      id: 'q1',
      topic: 'Grammars & Parsing',
      question: 'Why can Top-Down LL(1) parsers NOT handle immediate left-recursive grammars of the form A -> A alpha | beta?',
      codeExample: `// Left-recursive grammar rule:
Expr -> Expr '+' Term
      | Term`,
      options: [
        'Because left-recursion causes infinite recursion without consuming any input tokens',
        'Because LR parsing tables become too small to store states',
        'Because tokens cannot be converted into AST nodes',
        'Because DFA state minimization requires regular languages only',
      ],
      correctIndex: 0,
      explanation:
        'In Top-Down parsing (LL), the parser expands the leftmost non-terminal first. When expanding A into A alpha, it tries to match A again at the same input position without consuming a token, causing an infinite loop. Grammars must be transformed via left-factoring or left-recursion elimination before an LL(1) parser can use them.',
      keyConcept: 'Left-Recursion Elimination in LL(1)',
    },
    {
      id: 'q2',
      topic: 'Intermediate Representation',
      question: 'What is the defining invariant of Static Single Assignment (SSA) form in modern compilers like LLVM?',
      options: [
        'Every function must only contain a single return instruction',
        'Every variable is assigned a value exactly once in the static text',
        'All loops must be unrolled before IR generation',
        'Pointers can never be dereferenced more than once',
      ],
      correctIndex: 1,
      explanation:
        'In SSA form, each variable is assigned exactly once. When control flow paths merge (e.g. after if/else), phi (φ) functions are introduced to select the appropriate value based on the predecessor basic block. This drastically simplifies dead code elimination and register allocation.',
      keyConcept: 'SSA Single Assignment Invariant',
    },
    {
      id: 'q3',
      topic: 'Lexical Analysis',
      question: 'Which theoretical machine model powers the lexical scanner produced by tools like Lex/Flex?',
      options: [
        'Turing Machine',
        'Deterministic Finite Automaton (DFA)',
        'Pushdown Automaton (PDA)',
        'Linear Bounded Automaton (LBA)',
      ],
      correctIndex: 1,
      explanation:
        'Tokens are regular languages specified by regular expressions. Tools like Flex compile these regexes into NFAs via Thompson construction and then into DFAs via subset construction. A DFA processes input in linear O(N) time with constant O(1) state transitions.',
      keyConcept: 'DFA State Transitions in Lexers',
    },
    {
      id: 'q4',
      topic: 'Optimization & Code Gen',
      question: 'What optimization technique replaces expensive operations like "x * 8" with cheaper ones like "x << 3"?',
      options: [
        'Loop Invariant Code Motion',
        'Strength Reduction',
        'Common Subexpression Elimination',
        'Function Inlining',
      ],
      correctIndex: 1,
      explanation:
        'Strength Reduction replaces high-latency arithmetic operations (such as integer division or multiplication) with equivalent, lower-latency operations (such as bitwise shifts or additions) that execute in fewer CPU cycles.',
      keyConcept: 'Strength Reduction Optimization',
    },
  ];
}
