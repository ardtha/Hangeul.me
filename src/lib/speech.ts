export function canSpeakKorean(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakKorean(text: string): void {
  if (!text || !canSpeakKorean()) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Graceful no-op when browser blocks speech synthesis
  }
}
