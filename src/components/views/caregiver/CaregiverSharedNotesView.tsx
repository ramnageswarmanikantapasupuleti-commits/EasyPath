import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Pin,
  Heart,
  Volume2,
  Mic,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useSpeech } from '../../../hooks/useSpeech';

export const CaregiverSharedNotesView: React.FC = () => {
  const { sharedNotes, addSharedNote, profile, settings, openTranscriber } = useApp();
  const { speak } = useSpeech(settings.speechSpeed);

  const [messageText, setMessageText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    addSharedNote(messageText.trim());
    setMessageText('');
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      <div>
        <h1 className="font-heading font-black text-2xl text-gray-900 dark:text-white">
          Shared Notes & Messages
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Messages appear directly on Alex's home dashboard and can be read aloud
        </p>
      </div>

      {/* Message Compose Box */}
      <form
        onSubmit={handleSend}
        className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs flex flex-col gap-3"
      >
        <textarea
          rows={3}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder={`Leave a gentle reminder or encouraging note for ${profile.preferredName || 'Alex'}...`}
          className="w-full p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium outline-none focus:border-[#2C5F8A]"
        />

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              openTranscriber((text) =>
                setMessageText((prev) => (prev ? `${prev} ${text}` : text))
              )
            }
            className="px-4 py-2.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Dictate Note (Gemini)</span>
          </button>

          <button
            type="submit"
            disabled={!messageText.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#2C5F8A] hover:bg-blue-900 text-white font-extrabold text-xs flex items-center gap-2 shadow disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Note</span>
          </button>
        </div>
      </form>

      {/* Notes Stream */}
      <div className="space-y-3">
        {sharedNotes.map((note) => (
          <div
            key={note.id}
            className={`p-4 sm:p-5 rounded-3xl border transition space-y-2 ${
              note.isPinned
                ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 shadow-xs'
                : 'bg-white dark:bg-[#1E293B] border-[#E8E5DF] dark:border-gray-800 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-[#2C5F8A] dark:text-blue-300">
                  {note.author}
                </span>
                {note.isPinned && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                    <Pin className="w-2.5 h-2.5" />
                    <span>Pinned</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[11px] font-mono text-gray-400">{note.timestamp}</span>
                <button
                  onClick={() => speak(`${note.author} said: ${note.text}`)}
                  className="p-1 text-gray-400 hover:text-[#2C5F8A]"
                  title="Read aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
              "{note.text}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
