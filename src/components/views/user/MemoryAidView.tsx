import React, { useState } from 'react';
import {
  Users,
  Box,
  Phone,
  Volume2,
  Plus,
  X,
  Search,
  Heart,
  Trash2,
  Mic,
  MicOff,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useSpeech } from '../../../hooks/useSpeech';
import { MemoryContact } from '../../../types';

export const MemoryAidView: React.FC = () => {
  const { contacts, addContact, deleteContact, settings } = useApp();
  const { speak, startListening, stopListening, isListening } = useSpeech(settings.speechSpeed);

  const [tab, setTab] = useState<'contacts' | 'objects'>('contacts');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPhoto, setNewPhoto] = useState('');

  const filteredItems = contacts.filter((item) => {
    const matchesTab = tab === 'contacts' ? item.type === 'contact' : item.type === 'object';
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.relationshipOrCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.note.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newContact: MemoryContact = {
      id: `mem-${Date.now()}`,
      type: tab === 'contacts' ? 'contact' : 'object',
      name: newName.trim(),
      relationshipOrCategory: newRelationship.trim() || (tab === 'contacts' ? 'Friend' : 'Daily Item'),
      note: newNote.trim() || 'No additional notes.',
      photoUrl:
        newPhoto.trim() ||
        (tab === 'contacts'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
          : 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=300&q=80'),
      phone: newPhone.trim() || undefined,
    };

    addContact(newContact);
    setShowAddModal(false);
    setNewName('');
    setNewRelationship('');
    setNewNote('');
    setNewPhone('');
    setNewPhoto('');
    speak(`Added ${newContact.name} to your memory aid.`);
  };

  const handleReadItem = (item: MemoryContact) => {
    const speech = `${item.name}. ${item.relationshipOrCategory}. Note: ${item.note}`;
    speak(speech);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 dark:text-white">
            Memory Aid
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Familiar faces and where things are kept
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#4A90D9] hover:bg-[#2C5F8A] text-white font-extrabold text-xs shadow transition active:scale-95 touch-target"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add {tab === 'contacts' ? 'Person' : 'Object'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setTab('contacts')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            tab === 'contacts'
              ? 'bg-white dark:bg-gray-700 text-[#2C5F8A] dark:text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>People in My Life ({contacts.filter((c) => c.type === 'contact').length})</span>
        </button>

        <button
          onClick={() => setTab('objects')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            tab === 'objects'
              ? 'bg-white dark:bg-gray-700 text-[#2C5F8A] dark:text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>My Items ({contacts.filter((c) => c.type === 'object').length})</span>
        </button>
      </div>

      {/* Search Bar with Voice Recognition */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${tab === 'contacts' ? 'people by name or role' : 'items'}...`}
          className="w-full pl-10 pr-12 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E293B] text-sm font-medium outline-none focus:border-[#4A90D9]"
        />
        <button
          type="button"
          onClick={() => {
            if (isListening) {
              stopListening();
            } else {
              startListening((transcript) => {
                setSearchQuery(transcript);
                speak(`Searching for ${transcript}`);
              });
            }
          }}
          className={`absolute right-2.5 top-2 p-1.5 rounded-xl transition ${
            isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-gray-400 hover:text-[#4A90D9]'
          }`}
          title="Voice search"
          aria-label="Voice search"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs flex flex-col justify-between hover:border-[#4A90D9]/40 transition"
          >
            <div className="flex items-start gap-3.5 mb-3">
              <img
                src={item.photoUrl}
                alt={item.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-100 dark:ring-gray-800 shrink-0"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                    {item.name}
                  </h3>
                  <button
                    onClick={() => handleReadItem(item)}
                    className="p-1 text-gray-400 hover:text-[#4A90D9] shrink-0"
                    aria-label="Read details"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <span className="inline-block text-xs font-bold text-[#4A90D9] mb-1">
                  {item.relationshipOrCategory}
                </span>

                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                  {item.note}
                </p>
              </div>
            </div>

            {/* Bottom Actions: Call and Delete */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
              {item.phone ? (
                <a
                  href={`tel:${item.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-[#4CAF7D]" />
                  <span>Call {item.name.split(' ')[0]}</span>
                </a>
              ) : (
                <span className="text-[11px] text-gray-400">In your library</span>
              )}

              <button
                onClick={() => deleteContact(item.id)}
                className="p-1.5 text-gray-300 hover:text-rose-500 rounded-lg transition"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white dark:bg-[#1E293B] rounded-3xl border border-[#E8E5DF] dark:border-gray-800">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-gray-600 dark:text-gray-300 text-sm">
              No {tab === 'contacts' ? 'people' : 'items'} found matching your search.
            </p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1E293B] p-6 shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-extrabold text-lg text-gray-900 dark:text-white">
                Add to {tab === 'contacts' ? 'Contacts' : 'Everyday Items'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={tab === 'contacts' ? 'e.g. Uncle David' : 'e.g. House Keys'}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium outline-none focus:border-[#4A90D9]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  {tab === 'contacts' ? 'Relationship / Role' : 'Category'}
                </label>
                <input
                  type="text"
                  value={newRelationship}
                  onChange={(e) => setNewRelationship(e.target.value)}
                  placeholder={tab === 'contacts' ? 'e.g. My Uncle' : 'e.g. Keys & Wallet'}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium outline-none focus:border-[#4A90D9]"
                />
              </div>

              {tab === 'contacts' && (
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g. 555-019-3388"
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium outline-none focus:border-[#4A90D9]"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Helpful Notes
                </label>
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={
                    tab === 'contacts'
                      ? 'e.g. Lives next door, loves gardening.'
                      : 'e.g. Always kept on the key hook by the front door.'
                  }
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium outline-none focus:border-[#4A90D9]"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#4A90D9] text-white font-extrabold text-sm shadow hover:bg-[#2C5F8A]"
                >
                  Save Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full py-2 text-xs text-gray-500 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
