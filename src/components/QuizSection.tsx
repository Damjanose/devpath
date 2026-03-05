import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Zap, ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct answer
  explanation?: string;
}

interface QuizSectionProps {
  questions: QuizQuestion[];
  onComplete?: (score: number) => void;
  onContinue?: () => void;
  pointsReward?: number;
}

export function QuizSection({ questions, onComplete, onContinue, pointsReward = 50 }: QuizSectionProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  const selectOption = useCallback((index: number) => {
    if (showFeedback) return; // Don't allow changes after submit
    setSelectedAnswer(index);
  }, [showFeedback]);

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowFeedback(true);
    
    if (selectedAnswer === question.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    const updatedScore = selectedAnswer === question.correctAnswer ? score + 1 : score;
    
    if (isLastQuestion) {
      setFinalScore(updatedScore);
      setCompleted(true);
      onComplete?.(updatedScore);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setFinalScore(0);
    setCompleted(false);
  };

  if (completed) {
    const percentage = Math.round((finalScore / questions.length) * 100);
    const isPassing = percentage >= 70;

    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isPassing ? (
              <>
                <CheckCircle2 className="h-6 w-6 text-primary" />
                Quiz Completed!
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-destructive" />
                More Practice Needed
              </>
            )}
          </CardTitle>
          <CardDescription>
            You scored {finalScore} out of {questions.length} ({percentage}%)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={cn(
            "text-center p-6 rounded-lg border-2",
            isPassing ? "border-primary bg-primary/5" : "border-muted bg-muted/5"
          )}>
            <div className="text-4xl font-bold mb-2">{percentage}%</div>
            <div className="text-sm text-muted-foreground mb-4">
              {isPassing ? "Great job! You've mastered this section." : "Try reviewing the material and retake the quiz."}
            </div>
            {isPassing && (
              <div className="flex items-center justify-center gap-1 font-mono text-gold">
                <Zap className="h-4 w-4" />
                +{pointsReward} XP
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            {!isPassing && (
              <Button onClick={handleRetry} className="w-full gap-2" variant="outline">
                <RotateCcw className="h-4 w-4" /> Retry Quiz
              </Button>
            )}
            {onContinue && (
              <Button onClick={onContinue} className="w-full gap-2" variant={isPassing ? "default" : "ghost"}>
                {isPassing ? (
                  <>Next Lesson <ArrowRight className="h-4 w-4" /></>
                ) : (
                  "Continue without XP"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Quiz Question {currentQuestion + 1} of {questions.length}</CardTitle>
          <span className="text-sm text-muted-foreground">
            Score: {score}/{currentQuestion}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{question.question}</h3>
          
          <div className="space-y-3" role="radiogroup">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctAnswer;
              const showCorrect = showFeedback && isCorrect;
              const showIncorrect = showFeedback && isSelected && !isCorrect;

              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => selectOption(index)}
                  disabled={showFeedback}
                  className={cn(
                    "flex items-center gap-3 w-full text-left rounded-lg border-2 p-4 transition-all",
                    showFeedback
                      ? "cursor-default"
                      : "cursor-pointer hover:bg-accent/50 active:scale-[0.99]",
                    showCorrect && "border-primary bg-primary/10",
                    showIncorrect && "border-destructive bg-destructive/10",
                    !showFeedback && isSelected && "border-primary bg-primary/5",
                    !showFeedback && !isSelected && "border-border"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 rounded-full border-2 transition-colors",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/40"
                    )}
                  />
                  <Label className="flex-1 cursor-pointer text-sm font-normal">
                    {option}
                  </Label>
                  {showCorrect && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                  {showIncorrect && <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {showFeedback && question.explanation && (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium mb-1">Explanation:</p>
            <p className="text-sm text-muted-foreground">{question.explanation}</p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          {!showFeedback ? (
            <Button 
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
            >
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {isLastQuestion ? "Finish Quiz" : "Next Question"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
