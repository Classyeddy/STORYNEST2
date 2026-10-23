import React, { useState, useMemo } from 'react';
import { Search, Star, Filter, AlertCircle, BookOpen } from 'lucide-react';
import { Story } from '../types';

interface DiscoverViewProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
}

const GENRES = ['All', 'Fantasy', 'Sci-Fi', 'Romance', 'Thriller', 'Mystery', 'Adventure', 'Action', 'Drama'];

export const DiscoverView: React.FC<DiscoverViewProps> = ({ stories, onSelectStory }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'ongoing' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'chapters' | 'reads'>('rating');

  const filteredStories = useMemo(() => {
    return stories
      .filter((st) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          st.title.toLowerCase().includes(query) ||
          st.authorName.toLowerCase().includes(query) ||
          st.synopsis.toLowerCase().includes(query) ||
          (st.tags && st.tags.some((t) => t.toLowerCase().includes(query)));

        const matchesGenre = selectedGenre === 'All' || st.genres.includes(selectedGenre);
        const matchesStatus = selectedStatus === 'all' || st.status === selectedStatus;

        return matchesSearch && matchesGenre && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.ratingAverage - a.ratingAverage;
        if (sortBy === 'chapters') return b.chapterCount - a.chapterCount;
        if (sortBy === 'reads') return b.viewsCount - a.viewsCount;
        return 0;
      });
  }, [stories, searchQuery, selectedGenre, selectedStatus, sortBy]);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Search Input Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by story title, African mythology, author, or keywords..."
          className="w-full bg-[#181A20] border border-gray-800 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-3 text-xs text-gray-500 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Genre Filter Scroll Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedGenre === genre
                ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                : 'bg-[#181A20] text-gray-400 border border-gray-800 hover:text-white hover:border-gray-700'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Secondary Filter & Sort Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400 px-1">
        <div className="flex items-center gap-2">
          <span>Status:</span>
          {(['all', 'ongoing', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 rounded-lg capitalize font-medium transition ${
                selectedStatus === st ? 'bg-white/10 text-white font-bold' : 'hover:text-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#181A20] border border-gray-800 rounded-lg px-2.5 py-1 text-white font-semibold focus:outline-none focus:border-amber-500"
          >
            <option value="rating">Highest Rated</option>
            <option value="reads">Most Reads</option>
            <option value="chapters">Most Chapters</option>
          </select>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredStories.map((story) => (
          <div
            key={story.id}
            onClick={() => onSelectStory(story)}
            className="bg-[#181A20] rounded-2xl p-3 border border-gray-800/80 hover:border-amber-500/40 cursor-pointer transition flex flex-col group shadow-lg hover:shadow-amber-500/5"
          >
            <div className="relative overflow-hidden rounded-xl mb-2.5">
              <img
                src={story.coverImage}
                alt={story.title}
                className="w-full h-44 sm:h-52 object-cover rounded-xl group-hover:scale-105 transition duration-300"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/75 backdrop-blur-sm text-amber-400">
                {story.genres[0]}
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-snug">
              {story.title}
            </h4>
            <p className="text-[11px] text-gray-400 truncate mb-2">{story.authorName}</p>

            <div className="mt-auto flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-800/80 pt-2">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star size={11} fill="currentColor" /> {story.ratingAverage.toFixed(1)}
              </span>
              <span>{story.chapterCount} chs</span>
            </div>
          </div>
        ))}
      </div>

      {filteredStories.length === 0 && (
        <div className="py-20 text-center text-gray-500 bg-[#181A20] rounded-3xl border border-gray-800 p-8">
          <AlertCircle size={36} className="mx-auto mb-3 opacity-40 text-amber-400" />
          <h4 className="text-sm font-bold text-white mb-1">No African serials found</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
            Try adjusting your search terms or picking another genre filter like Fantasy or Sci-Fi.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGenre('All');
              setSelectedStatus('all');
            }}
            className="px-4 py-2 bg-amber-500 text-black text-xs font-bold rounded-xl hover:bg-amber-400 transition"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
