import { useState, useRef, useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Lightbulb,
  Eye,
  Zap,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

interface CodingChallengeProps {
  /** Markdown description of the challenge */
  description?: string;
  starterCode?: string;
  testCode?: string;
  solutionCode?: string;
  language?: string;
  hints?: string[];
  bonusPoints?: number;
  pointsReward?: number;
  onPass?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Sandbox test runner: evaluates user code + test assertions in a    */
/*  Web Worker (no network, no DOM)                                    */
/* ------------------------------------------------------------------ */

function buildWorkerScript(userCode: string, testCode: string): string {
  // Minimal `expect` and `test` implementation that runs in a Worker
  return `
    "use strict";
    const __results = [];
    let __currentTest = "";

    function expect(actual) {
      return {
        toBe(expected) {
          if (actual !== expected)
            throw new Error("Expected " + JSON.stringify(expected) + " but got " + JSON.stringify(actual));
        },
        toEqual(expected) {
          if (JSON.stringify(actual) !== JSON.stringify(expected))
            throw new Error("Expected " + JSON.stringify(expected) + " but got " + JSON.stringify(actual));
        },
        toBeTruthy() {
          if (!actual) throw new Error("Expected truthy but got " + JSON.stringify(actual));
        },
        toBeFalsy() {
          if (actual) throw new Error("Expected falsy but got " + JSON.stringify(actual));
        },
        toContain(item) {
          const s = typeof actual === "string" ? actual : JSON.stringify(actual);
          if (!s.includes(typeof item === "string" ? item : JSON.stringify(item)))
            throw new Error("Expected to contain " + JSON.stringify(item));
        },
        not: {
          toBe(expected) {
            if (actual === expected)
              throw new Error("Expected NOT " + JSON.stringify(expected));
          },
          toContain(item) {
            const s = typeof actual === "string" ? actual : JSON.stringify(actual);
            if (s.includes(typeof item === "string" ? item : JSON.stringify(item)))
              throw new Error("Expected NOT to contain " + JSON.stringify(item));
          },
        },
      };
    }

    function test(name, fn) {
      __currentTest = name;
      try { fn(); __results.push({ name, passed: true }); }
      catch (e) { __results.push({ name, passed: false, message: e.message }); }
    }
    const it = test;
    const describe = (_name, fn) => fn();

    /* ---- user code (as string, available for assertion inspection) ---- */
    const __userCodeString = ${JSON.stringify(userCode)};

    /* ---- user code execution ---- */
    try {
      ${userCode}
    } catch (_userErr) {
      __results.push({ name: "Code Execution", passed: false, message: _userErr.message });
    }

    /* ---- test code ---- */
    try {
      ${testCode}
    } catch (_testErr) {
      __results.push({ name: "Test Suite", passed: false, message: _testErr.message });
    }

    postMessage(__results);
  `;
}

function runTests(userCode: string, testCode: string): Promise<TestResult[]> {
  return new Promise((resolve) => {
    const blob = new Blob([buildWorkerScript(userCode, testCode)], {
      type: "application/javascript",
    });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    const timeout = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve([{ name: "Timeout", passed: false, message: "Code took too long (5 s limit)" }]);
    }, 5000);

    worker.onmessage = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(e.data as TestResult[]);
    };

    worker.onerror = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve([{ name: "Runtime Error", passed: false, message: e.message }]);
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Monaco language mapping                                            */
/* ------------------------------------------------------------------ */

function monacoLang(lang?: string): string {
  const map: Record<string, string> = {
    typescript: "typescript",
    javascript: "javascript",
    ts: "typescript",
    js: "javascript",
    python: "python",
    csharp: "csharp",
    sql: "sql",
    bash: "shell",
    html: "html",
    css: "css",
    json: "json",
  };
  return map[lang?.toLowerCase() ?? ""] ?? "javascript";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CodingChallenge({
  description,
  starterCode = "",
  testCode = "",
  solutionCode,
  language,
  hints = [],
  bonusPoints = 0,
  pointsReward = 30,
  onPass,
}: CodingChallengeProps) {
  const [code, setCode] = useState(starterCode);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [passed, setPassed] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [revealedHints, setRevealedHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const editorRef = useRef<unknown>(null);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleRun = useCallback(async () => {
    setRunning(true);
    setResults(null);
    try {
      const res = await runTests(code, testCode);
      setResults(res);
      const allPassed = res.length > 0 && res.every((r) => r.passed);
      if (allPassed && !passed) {
        setPassed(true);
        onPass?.();
      }
    } finally {
      setRunning(false);
    }
  }, [code, testCode, passed, onPass]);

  const handleReset = () => {
    setCode(starterCode);
    setResults(null);
    setPassed(false);
  };

  const revealNextHint = () => {
    setRevealedHints((prev) => Math.min(prev + 1, hints.length));
  };

  const allPassed = results !== null && results.length > 0 && results.every((r) => r.passed);
  const anyFailed = results !== null && results.some((r) => !r.passed);

  return (
    <div className="space-y-5">
      {/* ---- Description ---- */}
      {description && (
        <div className="prose prose-invert prose-green max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-code:text-primary prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-li:text-foreground/90">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
        </div>
      )}

      {/* ---- Editor ---- */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-4 py-2">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            {language ?? "javascript"}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleReset}
              className="h-7 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" /> Reset
            </Button>
          </div>
        </div>

        <Editor
          height="320px"
          language={monacoLang(language)}
          value={code}
          onChange={(v) => setCode(v ?? "")}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            wordWrap: "on",
            tabSize: 2,
          }}
        />
      </div>

      {/* ---- Run / Actions bar ---- */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="hero"
          onClick={handleRun}
          disabled={running || passed}
          className="gap-2"
        >
          {running ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Running…
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Run Tests
            </>
          )}
        </Button>

        {hints.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowHints(!showHints);
              if (!showHints && revealedHints === 0) revealNextHint();
            }}
            className="gap-1"
          >
            <Lightbulb className="h-4 w-4 text-yellow-400" />
            Hints {showHints ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        )}

        {solutionCode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSolution(!showSolution)}
            className="gap-1 text-muted-foreground"
          >
            <Eye className="h-4 w-4" />
            {showSolution ? "Hide Solution" : "Show Solution"}
          </Button>
        )}
      </div>

      {/* ---- Hints ---- */}
      {showHints && hints.length > 0 && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="pt-4 space-y-2">
            {hints.slice(0, revealedHints).map((hint, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                <span className="text-foreground/90">{hint}</span>
              </div>
            ))}
            {revealedHints < hints.length && (
              <Button variant="ghost" size="sm" onClick={revealNextHint} className="text-xs">
                Reveal next hint ({revealedHints}/{hints.length})
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* ---- Solution ---- */}
      {showSolution && solutionCode && (
        <div className="rounded-lg border border-primary/30 overflow-hidden">
          <div className="bg-primary/10 px-4 py-2 text-xs font-mono text-primary">
            SOLUTION
          </div>
          <Editor
            height="240px"
            language={monacoLang(language)}
            value={solutionCode}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
              wordWrap: "on",
              tabSize: 2,
            }}
          />
        </div>
      )}

      {/* ---- Test Results ---- */}
      {results && (
        <Card
          className={cn(
            "border-2 transition-colors",
            allPassed ? "border-primary bg-primary/5" : "border-destructive/50 bg-destructive/5"
          )}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              {allPassed ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  All Tests Passed!
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  {results.filter((r) => !r.passed).length} of {results.length} test
                  {results.length > 1 ? "s" : ""} failed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {results.map((r, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-2 rounded-md px-3 py-2 text-sm font-mono",
                  r.passed ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                )}
              >
                {r.passed ? (
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                )}
                <div>
                  <span>{r.name}</span>
                  {r.message && <p className="text-xs opacity-75 mt-0.5">{r.message}</p>}
                </div>
              </div>
            ))}

            {allPassed && (
              <div className="flex items-center justify-center gap-1 pt-2 font-mono text-gold text-lg">
                <Zap className="h-5 w-5" />
                +{pointsReward}{bonusPoints > 0 ? ` (+${bonusPoints} bonus)` : ""} XP
              </div>
            )}

            {anyFailed && (
              <p className="text-xs text-muted-foreground pt-1">
                Fix the failing tests and run again. Use hints if you're stuck!
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
