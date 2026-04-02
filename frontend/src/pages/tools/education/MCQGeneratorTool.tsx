import { useState } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Download,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import ToolLayout from "@/components/layout/ToolLayout";
import jsPDF from "jspdf";

const categoryColor = "145 70% 45%";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

const MCQGeneratorTool = () => {
  const [inputText, setInputText] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  });

  const generateQuestionsFromText = () => {
    if (!inputText.trim()) return;

    // Simple text-based question generation (basic implementation)
    const sentences = inputText.split(".").filter((s) => s.trim().length > 20);
    const newQuestions: Question[] = [];

    sentences.slice(0, 5).forEach((sentence, index) => {
      const words = sentence.trim().split(" ");
      if (words.length > 5) {
        const question = `What is the main idea of: "${sentence.trim().substring(0, 50)}..."?`;
        const options = [
          sentence.trim().substring(0, 30) + "...",
          "Alternative option A",
          "Alternative option B",
          "Alternative option C",
        ];

        newQuestions.push({
          id: Date.now().toString() + index,
          question,
          options,
          correctAnswer: 0,
        });
      }
    });

    setQuestions([...questions, ...newQuestions]);
    setInputText("");
  };

  const addCustomQuestion = () => {
    console.log("addCustomQuestion called");
    console.log("currentQuestion:", currentQuestion);

    if (
      !currentQuestion.question ||
      currentQuestion.options.some((opt) => !opt.trim())
    ) {
      console.log("Validation failed - missing question or empty options");
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      question: currentQuestion.question,
      options: [...currentQuestion.options],
      correctAnswer: currentQuestion.correctAnswer,
    };

    console.log("Adding new question:", newQuestion);
    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    });
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "mcq-questions.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const exportToPDF = () => {
    if (questions.length === 0) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 30;

    // Title
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("Multiple Choice Questions", pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 20;

    // Questions
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");

    questions.forEach((q, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 30;
      }

      // Question number and text
      pdf.setFont("helvetica", "bold");
      pdf.text(`${index + 1}. ${q.question}`, margin, yPosition);
      yPosition += 10;

      // Options
      pdf.setFont("helvetica", "normal");
      q.options.forEach((option, optIndex) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 30;
        }

        const isCorrect = optIndex === q.correctAnswer;
        const optionText = `   ${String.fromCharCode(65 + optIndex)}. ${option}${isCorrect ? " ✓" : ""}`;

        if (isCorrect) {
          pdf.setTextColor(0, 128, 0); // Green color for correct answer
          pdf.setFont("helvetica", "bold");
        } else {
          pdf.setTextColor(0, 0, 0); // Black color
          pdf.setFont("helvetica", "normal");
        }

        pdf.text(optionText, margin, yPosition);
        yPosition += 8;
      });

      yPosition += 10; // Space between questions
    });

    // Save the PDF
    pdf.save("mcq-questions.pdf");
  };

  const exportToGoogleForm = () => {
    if (questions.length === 0) return;

    // Format questions for easy copying into Google Forms
    let formattedText = "MCQ Quiz\n\n";

    questions.forEach((q, index) => {
      formattedText += `${index + 1}. ${q.question}\n\n`;

      q.options.forEach((option, optIndex) => {
        const isCorrect = optIndex === q.correctAnswer;
        formattedText += `   ${String.fromCharCode(65 + optIndex)}. ${option}${isCorrect ? " ✓" : ""}\n`;
      });

      formattedText += "\n";
    });

    // Copy to clipboard
    navigator.clipboard
      .writeText(formattedText)
      .then(() => {
        // Open Google Forms in a new tab
        window.open("https://docs.google.com/forms/create", "_blank");

        // Show success message
        alert(
          "Questions copied to clipboard! Paste them into your Google Form.",
        );
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        alert("Failed to copy questions. Please copy them manually.");
      });
  };

  const exportToWord = () => {
    if (questions.length === 0) return;

    let content = `<html><head><meta charset="utf-8"><title>MCQ Questions</title></head><body>`;
    content += `<h1>Multiple Choice Questions</h1>`;

    questions.forEach((q, index) => {
      content += `<h3>${index + 1}. ${q.question}</h3>`;
      content += `<ol type="A">`;
      q.options.forEach((option, optIndex) => {
        const isCorrect = optIndex === q.correctAnswer;
        content += `<li style="color: ${isCorrect ? "green" : "black"}; font-weight: ${isCorrect ? "bold" : "normal"}">${option}${isCorrect ? " ✓" : ""}</li>`;
      });
      content += `</ol><br>`;
    });

    content += `</body></html>`;

    const blob = new Blob([content], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mcq-questions.doc";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout
      title="MCQ Generator from Text"
      description="Generate multiple choice questions from text or create custom questions"
      category="Education Tools"
      categoryPath="/category/education"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Text Input Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate from Text
          </h3>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your text here to generate MCQ questions automatically..."
            className="input-tool min-h-[120px] resize-none"
          />

          <button
            onClick={generateQuestionsFromText}
            className="btn-primary mt-4"
          >
            Generate Questions
          </button>
        </div>

        {/* Custom Question Form */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Custom Question
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Question</label>
              <input
                type="text"
                value={currentQuestion.question}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    question: e.target.value,
                  })
                }
                placeholder="Enter your question here..."
                className="input-tool"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Options</label>
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      value={index.toString()}
                      checked={currentQuestion.correctAnswer === index}
                      onChange={() =>
                        setCurrentQuestion((prev) => ({
                          ...prev,
                          correctAnswer: index,
                        }))
                      }
                      aria-label={`Mark option ${index + 1} as correct answer`}
                      className="h-4 w-4"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="input-tool flex-1"
                    />
                    {currentQuestion.correctAnswer === index && (
                      <span className="text-sm text-primary font-medium">
                        Correct
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={addCustomQuestion} className="btn-primary">
              <Plus className="h-5 w-5" />
              Add Question
            </button>
          </div>
        </div>

        {/* Questions List */}
        {questions.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Generated Questions ({questions.length})
              </h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="btn-secondary flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export Options
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportToJSON}>
                    Export JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToPDF}>
                    Export to PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToGoogleForm}>
                    Export to Google Form
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToWord}>
                    Export to Word
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-4">
              {questions.map((question, qIndex) => (
                <div
                  key={question.id}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium mb-3">
                        {qIndex + 1}. {question.question}
                      </h4>
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div
                            key={oIndex}
                            className={`flex items-center gap-2 p-2 rounded ${
                              question.correctAnswer === oIndex
                                ? "bg-primary/10 border border-primary/20"
                                : "bg-muted/30"
                            }`}
                          >
                            <span className="text-sm font-medium">
                              {String.fromCharCode(65 + oIndex)}.
                            </span>
                            <span className="text-sm">{option}</span>
                            {question.correctAnswer === oIndex && (
                              <span className="text-xs text-primary font-medium ml-auto">
                                ✓ Correct
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove question ${qIndex + 1}`}
                      onClick={() => removeQuestion(question.id)}
                      className="ml-4 text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default MCQGeneratorTool;
