import { useEffect, useState } from "react";
import { Star } from "lucide-react";

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
  const [quizData, setQuizData] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [bookmarked, setBookmarked] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ category: "", question: "", answer: "" });
  const [newQuestion, setNewQuestion] = useState({ category: "", question: "", answer: "" });

  // ✅ 닉네임 관리
  const [nickname, setNickname] = useState(localStorage.getItem("nickname") || "");
  const [showNicknamePopup, setShowNicknamePopup] = useState(!localStorage.getItem("nickname"));

  // ✅ 닉네임 입력 완료
  const handleConfirmNickname = () => {
    if (!nickname.trim()) return alert("닉네임을 입력하세요!");
    localStorage.setItem("nickname", nickname);
    setShowNicknamePopup(false);
    loadQuizData();
  };

  // ✅ 데이터 불러오기
  async function loadQuizData() {
    try {
      const res = await fetch(`/api/getQuizData?nickname=${nickname}`);
      const data = await res.json();
      if (data.quizData?.length) setQuizData(data.quizData);
      if (data.bookmarked) setBookmarked(data.bookmarked);
    } catch (e) {
      console.error("불러오기 실패:", e);
    }
  }

  // ✅ 데이터 저장
  async function saveQuizData(updatedQuizData = quizData, updatedBookmarked = bookmarked) {
    try {
      await fetch("/api/saveQuizData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizData: updatedQuizData,
          bookmarked: updatedBookmarked,
          nickname,
        }),
      });
    } catch (e) {
      console.error("저장 실패:", e);
    }
  }

  useEffect(() => {
    if (nickname) loadQuizData();
  }, []);

  const current = quizData[step] || {};
  const normalize = (str) => str.replace(/,|\s+/g, "").trim();

  const handleNext = (check = true) => {
    if (check && current.id) {
      const userAnswer = normalize(answers[current.id] || "");
      const correctAnswer = normalize(current.answer);
      const correct = userAnswer === correctAnswer;
      setIsCorrect(correct);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 1500);

      if (!correct && !bookmarked.includes(current.id)) {
        const updated = [...bookmarked, current.id];
        setBookmarked(updated);
        saveQuizData(quizData, updated);
      } else if (correct && bookmarked.includes(current.id)) {
        const updated = bookmarked.filter((id) => id !== current.id);
        setBookmarked(updated);
        saveQuizData(quizData, updated);
      }
    }

    if (step < quizData.length - 1) {
      setStep(step + 1);
      setRevealAnswer(false);
    } else {
      alert("🎉 모든 문제를 완료했습니다!");
    }
  };

  const handleSelectEdit = (id) => {
    const q = quizData.find((q) => q.id === id);
    if (q) {
      setEditingId(id);
      setEditData({ category: q.category, question: q.question, answer: q.answer });
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

  const handleDeleteQuestion = (id) => {
    const updated = quizData.filter((q) => q.id !== id);
    setQuizData(updated);
    saveQuizData(updated, bookmarked);
  };

  const handleGoToBookmarked = (id) => {
    const index = quizData.findIndex((q) => q.id === id);
    if (index !== -1) setStep(index);
  };

  if (showNicknamePopup) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-80 text-center animate-fade-in">
          <h2 className="text-lg font-bold text-green-800 mb-4">
            🌱 닉네임을 입력해주세요
          </h2>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="예: 상현"
            className="border p-2 rounded w-full mb-3 text-center"
          />
          <button
            onClick={handleConfirmNickname}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

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
            bookmarked.includes(current.id) ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          <Star fill={bookmarked.includes(current.id) ? "currentColor" : "none"} />
        </button>

        <h1 className="text-2xl font-bold text-green-800 mb-4 text-center">
          🌾 2025 농협 논술 핵심 암기 스터디
        </h1>

        {editMode ? (
          <>
            <h2 className="font-semibold mb-2 text-green-700">문제 목록</h2>
            <ul className="border rounded p-3 max-h-48 overflow-y-auto bg-white/70 mb-4">
              {quizData.map((q) => (
                <li key={q.id} className="flex justify-between">
                  <span
                    className="cursor-pointer hover:text-green-700"
                    onClick={() => handleSelectEdit(q.id)}
                  >
                    {q.question}
                  </span>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="text-red-500 text-sm"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>

            {editingId && (
              <>
                <Input
                  placeholder="카테고리"
                  value={editData.category}
                  onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                />
                <Input
                  placeholder="문제 수정"
                  value={editData.question}
                  onChange={(e) => setEditData({ ...editData, question: e.target.value })}
                />
                <Input
                  placeholder="정답 수정"
                  value={editData.answer}
                  onChange={(e) => setEditData({ ...editData, answer: e.target.value })}
                />
                <Button onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700 w-full">
                  수정 저장
                </Button>
              </>
            )}

            <div className="mt-6 space-y-2">
              <h2 className="text-lg font-semibold text-green-700">문제 추가</h2>
              <Input
                placeholder="카테고리"
                value={newQuestion.category}
                onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
              />
              <Input
                placeholder="문제 입력"
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
              />
              <Input
                placeholder="정답 입력"
                value={newQuestion.answer}
                onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
              />
              <Button onClick={handleAddQuestion} className="bg-blue-600 hover:bg-blue-700 w-full">
                문제 추가
              </Button>
            </div>
          </>
        ) : (
          <CardContent>
            <p className="text-gray-800 font-medium mb-4 leading-relaxed">{current.question}</p>
            <Input
              placeholder="답변 입력..."
              value={answers[current.id] || ""}
              onChange={(e) => setAnswers({ ...answers, [current.id]: e.target.value })}
              className="mb-4"
            />

            <div
              className="text-sm text-gray-700 mb-3 border p-2 rounded bg-white/70 cursor-pointer select-none"
              onClick={() => setRevealAnswer(!revealAnswer)}
            >
              <span className="font-semibold text-green-700">정답:</span>{" "}
              {revealAnswer ? current.answer : <span className="text-gray-400">[정답 보기]</span>}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <Button onClick={() => handleNext(true)} className="flex-1 bg-green-600 hover:bg-green-700">
                다음 문제 (채점)
              </Button>
              <Button onClick={() => handleNext(false)} className="flex-1 bg-blue-500 hover:bg-blue-600">
                건너뛰기
              </Button>
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">
              {step + 1} / {quizData.length} 문제
            </div>

            {bookmarked.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">⭐ 다시 볼 문제</p>
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
    </div>
  );
}
