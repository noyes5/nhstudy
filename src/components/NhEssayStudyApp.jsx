import { useEffect, useState } from "react";
import { Star } from "lucide-react";

const quizDataInitial = [
  {
    id: 1,
    category: "농가소득",
    question: "2025년 가구당 농가소득은 얼마인가?",
    answer: "5435만 원",
  },
  {
    id: 2,
    category: "농가소득",
    question: "2025년 농업소득은 얼마이며, 전년 대비 몇 % 증가했는가?",
    answer: "1278만 원 14.7% 증가",
  },
  {
    id: 3,
    category: "농가소득",
    question: "2025년 이전소득은 얼마이며, 증가 요인은 무엇인가?",
    answer: "3000만 원 내외 농업직불금 확대",
  },
  {
    id: 4,
    category: "농가소득",
    question: "농외소득의 금액과 증가율은?",
    answer: "2024만 원 1.2% 증가",
  },
  {
    id: 5,
    category: "직불제",
    question: "전략작물직불제의 목적은 무엇인가?",
    answer: "논 이외 작물 재배 유도로 쌀 과잉생산 완화",
  },
  {
    id: 6,
    category: "직불제",
    question: "공익직불제의 핵심 가치는 무엇인가?",
    answer: "농업의 공익적 기능 보장",
  },
  {
    id: 7,
    category: "청년농",
    question: "청년농 육성정책의 주요 목표는 무엇인가?",
    answer: "농촌 인력 구조 개선 및 지속가능한 농업 기반 구축",
  },
  {
    id: 8,
    category: "청년농",
    question: "영농정착지원금은 최대 몇 년간 지급되는가?",
    answer: "최대 3년",
  },
  {
    id: 9,
    category: "탄소중립",
    question: "농업 탄소중립 실현을 위한 주요 전략은?",
    answer: "스마트농업 확산과 저탄소 영농기술 도입",
  },
  {
    id: 10,
    category: "스마트농업",
    question: "스마트팜의 핵심 기술은 무엇인가?",
    answer: "IoT, 빅데이터, 인공지능 기반 자동화",
  },
  {
    id: 11,
    category: "스마트농업",
    question: "NH오늘농사 앱의 주요 기능은 무엇인가?",
    answer: "작물 생육관리 및 농자재 추천",
  },
  {
    id: 12,
    category: "기술",
    question: "MSA(마이크로서비스 아키텍처)의 장점은?",
    answer: "유연성과 확장성, 독립 배포 가능",
  },
  {
    id: 13,
    category: "기술",
    question: "API Gateway의 역할은 무엇인가?",
    answer: "서비스 간 통신 관리 및 인증, 로드밸런싱",
  },
  {
    id: 14,
    category: "기술",
    question:
      "Spring Cloud의 주요 구성요소 중 하나로 서비스 디스커버리를 제공하는 것은?",
    answer: "Eureka",
  },
  {
    id: 15,
    category: "데이터",
    question: "농협의 데이터 환류체계란 무엇인가?",
    answer: "중앙에서 수집한 데이터를 현장과 조합에 재공유하여 효율성 제고",
  },
  {
    id: 16,
    category: "정책",
    question: "경자유전 원칙의 의미는?",
    answer: "농지는 농민만이 소유하고 경작해야 한다는 원칙",
  },
  {
    id: 17,
    category: "정책",
    question: "로컬푸드 운동의 주요 목적은?",
    answer: "지역 농산물 소비를 통한 지역경제 활성화",
  },
];

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
}
function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}
function Button({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded font-semibold text-white transition ${className}`}
    >
      {children}
    </button>
  );
}
function Input({ value, onChange, placeholder, className = "" }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`border border-gray-300 rounded p-2 w-full focus:ring focus:ring-green-200 ${className}`}
    />
  );
}

export default function NhEssayStudyApp() {
  const [quizData, setQuizData] = useState(quizDataInitial);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [bookmarked, setBookmarked] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    category: "",
    question: "",
    answer: "",
  });
  const [newQuestion, setNewQuestion] = useState({
    category: "",
    question: "",
    answer: "",
  });

  async function saveQuizData(
    updatedQuizData = quizData,
    updatedBookmarked = bookmarked
  ) {
    try {
      await fetch("/api/saveQuizData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizData: updatedQuizData,
          bookmarked: updatedBookmarked,
        }),
      });
    } catch (e) {
      console.error("저장 실패:", e);
    }
  }

  // ✅ DB 불러오기
  async function loadQuizData() {
    try {
      const res = await fetch("/api/getQuizData");
      const data = await res.json();
      if (data.quizData?.length) setQuizData(data.quizData);
      if (data.bookmarked) setBookmarked(data.bookmarked);
    } catch (e) {
      console.error("불러오기 실패:", e);
    }
  }

  useEffect(() => {
    loadQuizData();
  }, []);

  const current = quizData[step];
  const normalize = (str) => str.replace(/,|\s+/g, "").trim();

  const handleNext = (check = true) => {
    if (check) {
      const userAnswer = normalize(answers[current.id] || "");
      const correctAnswer = normalize(current.answer);
      const correct = userAnswer === correctAnswer;
      setIsCorrect(correct);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 1500);

      if (!correct) {
        if (!bookmarked.includes(current.id)) {
          const updated = [...bookmarked, current.id];
          setBookmarked(updated);
          saveQuizData(quizData, updated); 
        }
      } else {
        if (bookmarked.includes(current.id)) {
          const updated = bookmarked.filter((id) => id !== current.id);
          setBookmarked(updated);
          saveQuizData(quizData, updated);
        }
      }
    }

    if (step < quizData.length - 1) {
      setStep(step + 1);
      setRevealAnswer(false);
    } else {
      alert("🎉 축하합니다! 모든 문제를 푸셨습니다!");
    }
  };

  const handleChange = (e) =>
    setAnswers({ ...answers, [current.id]: e.target.value });

  const handleGoToBookmarked = (id) => {
    const index = quizData.findIndex((q) => q.id === id);
    if (index !== -1) setStep(index);
  };

  const handleSelectEdit = (id) => {
    const q = quizData.find((q) => q.id === id);
    if (q) {
      setEditingId(id);
      setEditData({
        category: q.category,
        question: q.question,
        answer: q.answer,
      });
    }
  };

  const handleSaveEdit = () => {
    if (editingId) {
      const updated = quizData.map((q) =>
        q.id === editingId ? { ...q, ...editData } : q
      );
      setQuizData(updated);
      setEditingId(null);
      setEditData({ category: "", question: "", answer: "" });
      saveQuizData(updated, bookmarked);
    }
  };

  const handleAddQuestion = () => {
    const newId = quizData.length ? quizData[quizData.length - 1].id + 1 : 1;
    const updated = [...quizData, { id: newId, ...newQuestion }];
    setQuizData(updated);
    setNewQuestion({ category: "", question: "", answer: "" });
    saveQuizData(updated, bookmarked);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-green-100 p-6 relative">
      {showPopup && (
        <div
          className={`fixed top-10 px-6 py-3 rounded-lg shadow-lg text-white font-semibold z-50 ${
            isCorrect ? "bg-green-600" : "bg-red-500"
          } animate-fade-in-out`}
        >
          {isCorrect
            ? "✅ 정답입니다!"
            : "❌ 오답입니다! 다시 볼 문제에 추가되었습니다."}
        </div>
      )}

      <Card className="max-w-2xl w-full shadow-lg p-6 relative">
        <button
          onClick={() =>
            setBookmarked((prev) =>
              prev.includes(current.id)
                ? prev.filter((id) => id !== current.id)
                : [...prev, current.id]
            )
          }
          className={`absolute top-4 right-4 ${
            bookmarked.includes(current.id)
              ? "text-yellow-400"
              : "text-gray-300"
          }`}
        >
          <Star
            fill={bookmarked.includes(current.id) ? "currentColor" : "none"}
          />
        </button>

        <h1 className="text-2xl font-bold text-green-800 mb-4 text-center">
          🌾 2025 농협 논술 핵심 암기 스터디
        </h1>

        {editMode ? (
          <div className="space-y-3 mb-4">
            <h2 className="text-lg font-semibold text-green-700 mb-2">
              문제 목록
            </h2>
            <ul className="border rounded p-3 max-h-48 overflow-y-auto bg-white/70">
              {quizData.map((q) => (
                <li
                  key={q.id}
                  className="cursor-pointer hover:text-green-700"
                  onClick={() => handleSelectEdit(q.id)}
                >
                  {q.question}
                </li>
              ))}
            </ul>

            {editingId && (
              <div className="mt-3 space-y-2">
                <Input
                  placeholder="카테고리"
                  value={editData.category}
                  onChange={(e) =>
                    setEditData({ ...editData, category: e.target.value })
                  }
                />
                <Input
                  placeholder="문제 수정"
                  value={editData.question}
                  onChange={(e) =>
                    setEditData({ ...editData, question: e.target.value })
                  }
                />
                <Input
                  placeholder="정답 수정"
                  value={editData.answer}
                  onChange={(e) =>
                    setEditData({ ...editData, answer: e.target.value })
                  }
                />
                <Button
                  onClick={handleSaveEdit}
                  className="bg-green-600 hover:bg-green-700 w-full"
                >
                  수정 저장
                </Button>
              </div>
            )}

            <div className="mt-6 space-y-2">
              <h2 className="text-lg font-semibold text-green-700">
                문제 추가
              </h2>
              <Input
                placeholder="카테고리"
                value={newQuestion.category}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, category: e.target.value })
                }
              />
              <Input
                placeholder="문제 입력"
                value={newQuestion.question}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, question: e.target.value })
                }
              />
              <Input
                placeholder="정답 입력"
                value={newQuestion.answer}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, answer: e.target.value })
                }
              />
              <Button
                onClick={handleAddQuestion}
                className="bg-blue-600 hover:bg-blue-700 w-full"
              >
                문제 추가
              </Button>
            </div>
          </div>
        ) : (
          <CardContent>
            <p className="text-gray-800 font-medium mb-4 leading-relaxed">
              {current.question}
            </p>
            <Input
              placeholder="답변 입력..."
              value={answers[current.id] || ""}
              onChange={handleChange}
              className="mb-4"
            />

            <div
              className="text-sm text-gray-700 mb-3 border p-2 rounded bg-white/70 cursor-pointer select-none"
              onClick={() => setRevealAnswer(!revealAnswer)}
            >
              <span className="font-semibold text-green-700">정답:</span>{" "}
              {revealAnswer ? (
                current.answer
              ) : (
                <span className="text-gray-400">[정답 보기]</span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <Button
                onClick={() => handleNext(true)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                다음 문제 (채점)
              </Button>
              <Button
                onClick={() => handleNext(false)}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                건너뛰기
              </Button>
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">
              {step + 1} / {quizData.length} 문제
            </div>

            {bookmarked.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  ⭐ 다시 볼 문제
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {bookmarked.map((id) => {
                    const q = quizData.find((q) => q.id === id);
                    return (
                      <li
                        key={id}
                        className="cursor-pointer hover:text-green-700"
                        onClick={() => handleGoToBookmarked(id)}
                      >
                        {q?.question}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </CardContent>
        )}

        <Button
          onClick={() => setEditMode(!editMode)}
          className="mt-4 w-full bg-gray-400 hover:bg-gray-500"
        >
          {editMode ? "문제 풀기 모드로" : "문제 추가/수정 모드로"}
        </Button>
      </Card>

      <style jsx>{`
        @keyframes fade-in-out {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          20% {
            opacity: 1;
            transform: translateY(0);
          }
          80% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
        .animate-fade-in-out {
          animation: fade-in-out 1.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
