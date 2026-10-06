import React, { useState } from 'react';
import {
  Users,
  Heart,
  MessageSquare,
  Plus,
  Share2,
  Flag,
  ShieldCheck,
  Send,
  X,
  Sparkles,
  Filter,
} from 'lucide-react';
import type { UserProfile, CommunityPost, CommunityComment, CommunityTopic } from '../../types';
import {
  createCommunityPost,
  likeCommunityPost,
  getPostComments,
  addPostComment,
  reportCommunityPost,
} from '../../services/firebase/communityService';

interface CommunityScreenProps {
  profile: UserProfile | null;
  pregnancyWeek: number;
  posts: CommunityPost[];
  onPostsUpdated: () => void;
  onOpenAiChat: (prompt?: string) => void;
}

export const CommunityScreen: React.FC<CommunityScreenProps> = ({
  profile,
  pregnancyWeek,
  posts,
  onPostsUpdated,
  onOpenAiChat,
}) => {
  const [activeTab, setActiveTab] = useState<'for_you' | 'my_week' | 'questions' | 'experiences'>('for_you');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New post form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTopic, setNewTopic] = useState<CommunityTopic>('Baby movement');
  const [privacyChoice, setPrivacyChoice] = useState<'name' | 'mom' | 'anonymous'>('name');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Active Post Comments modal
  const [viewingCommentsPost, setViewingCommentsPost] = useState<CommunityPost | null>(null);
  const [commentsList, setCommentsList] = useState<CommunityComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Report modal
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  const topics: (string | CommunityTopic)[] = [
    'All',
    'Baby movement',
    'Sleep',
    'Food',
    'Emotional wellbeing',
    'Appointments',
    'Preparing for baby',
    'General experiences',
  ];

  // Filter posts
  let filteredPosts = posts;
  if (activeTab === 'my_week') {
    filteredPosts = filteredPosts.filter((p) => Math.abs(p.week - pregnancyWeek) <= 2);
  } else if (activeTab === 'questions') {
    filteredPosts = filteredPosts.filter((p) => p.title.includes('?') || p.content.includes('?'));
  }
  if (selectedTopic !== 'All') {
    filteredPosts = filteredPosts.filter((p) => p.topic === selectedTopic);
  }

  const handleLike = async (postId: string) => {
    try {
      await likeCommunityPost(postId);
      onPostsUpdated();
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleOpenComments = async (post: CommunityPost) => {
    setViewingCommentsPost(post);
    setIsLoadingComments(true);
    try {
      const list = await getPostComments(post.id);
      setCommentsList(list);
    } catch (err) {
      console.error('Comments fetch error:', err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingCommentsPost || !newCommentText.trim() || !profile) return;
    try {
      const authorName = profile.communityAnonymous
        ? 'Anonymous Mom'
        : profile.displayName || 'MomCare Member';

      const comment: CommunityComment = {
        id: `cmt_${Date.now()}`,
        postId: viewingCommentsPost.id,
        authorId: profile.id,
        authorDisplayName: authorName,
        content: newCommentText.trim(),
        createdAt: new Date().toISOString(),
      };
      await addPostComment(comment);
      setCommentsList((prev) => [...prev, comment]);
      setNewCommentText('');
      onPostsUpdated();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newTitle.trim() || !newContent.trim()) return;

    setIsSubmittingPost(true);
    try {
      let displayName = profile.displayName || 'MomCare Mother';
      if (privacyChoice === 'anonymous' || profile.communityAnonymous) {
        displayName = 'Anonymous Mom';
      } else if (privacyChoice === 'mom') {
        displayName = profile.babyNickname ? `Mom of "${profile.babyNickname}"` : `Mom in Week ${pregnancyWeek}`;
      }

      const post: CommunityPost = {
        id: `post_${Date.now()}`,
        authorId: profile.id,
        authorDisplayName: displayName,
        authorRole: `Week ${pregnancyWeek} • ${profile.firstPregnancy ? 'First Baby' : 'Experienced Mom'}`,
        week: pregnancyWeek,
        topic: newTopic,
        title: newTitle.trim(),
        content: newContent.trim(),
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
      };

      await createCommunityPost(post);
      setNewTitle('');
      setNewContent('');
      setShowCreateModal(false);
      onPostsUpdated();
    } catch (err) {
      console.error('Create post error:', err);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleSendReport = async () => {
    if (!profile || !reportingPostId || !reportReason.trim()) return;
    try {
      await reportCommunityPost(reportingPostId, profile.id, reportReason.trim());
      setReportingPostId(null);
      setReportReason('');
      alert('Thank you. Post flagged for moderation review.');
    } catch (err) {
      console.error('Report post error:', err);
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in">
      {/* Header */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E9DFDC] shadow-2xs space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F2E1E3] flex items-center justify-center text-[#9F5F6E]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-[#352F35]">MomCare Circle</h2>
              <p className="text-xs text-[#766D72]">Real maternal experiences & supportive connection</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#9F5F6E] text-white text-xs font-semibold hover:bg-[#8C5361] transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Safety Notice (Section 26) */}
      <div className="p-3 rounded-xl bg-[#FAF4E9] border border-[#F3DFC0] flex items-start gap-2 text-xs text-[#766D72]">
        <ShieldCheck className="w-4 h-4 text-[#D5A85C] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#352F35]">Community Safety Notice: </span>
          Posts and comments reflect personal experiences, not medical truth or clinical advice. For medical concerns, always consult your physician or use MomCare AI symptom assessment.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#FFFFFF] p-1 rounded-2xl border border-[#E9DFDC] shadow-2xs text-xs font-semibold">
        {(
          [
            { id: 'for_you', label: 'For You' },
            { id: 'my_week', label: `My Week (${pregnancyWeek})` },
            { id: 'questions', label: 'Questions' },
            { id: 'experiences', label: 'Experiences' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-[#F2E5E7] text-[#9F5F6E] shadow-2xs font-bold'
                : 'text-[#766D72] hover:text-[#352F35]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Topics Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTopic(t)}
            className={`px-3 py-1 rounded-xl whitespace-nowrap border transition-colors ${
              selectedTopic === t
                ? 'bg-[#9F5F6E] text-white border-[#9F5F6E] font-semibold'
                : 'bg-white text-[#766D72] border-[#E9DFDC] hover:bg-[#F2E5E7]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#E9DFDC] text-center text-xs text-[#766D72] space-y-2">
            <p>No posts in this category yet.</p>
            <p className="text-[11px]">Be the first mother to share your experience or ask a question!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-[#9F5F6E] text-white text-xs font-semibold hover:bg-[#8C5361] transition-colors"
            >
              Create First Post
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E9DFDC] shadow-2xs space-y-2.5"
            >
              {/* Author & Tag */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#F2E1E3] flex items-center justify-center text-xs font-bold text-[#9F5F6E]">
                    {post.authorDisplayName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#352F35]">{post.authorDisplayName}</h4>
                    <span className="text-[10px] text-[#766D72]">{post.authorRole || `Week ${post.week}`}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFEBF4] text-[#7E699B] font-semibold border border-[#E9DFDC]">
                    {post.topic}
                  </span>
                  <button
                    onClick={() => setReportingPostId(post.id)}
                    className="p-1 text-[#766D72] hover:text-[#C96B6B]"
                    title="Report post"
                  >
                    <Flag className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Title & Body */}
              <h3 className="font-bold text-sm text-[#352F35]">{post.title}</h3>
              <p className="text-xs text-[#352F35] leading-relaxed whitespace-pre-line">
                {post.content}
              </p>

              {/* Actions: Likes, Comments, Discuss with AI */}
              <div className="pt-2 border-t border-[#E9DFDC]/60 flex items-center justify-between text-xs text-[#766D72]">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 hover:text-[#C98291] transition-colors"
                  >
                    <Heart className="w-4 h-4 text-[#C98291] fill-current/20" />
                    <span>{post.likesCount}</span>
                  </button>
                  <button
                    onClick={() => handleOpenComments(post)}
                    className="flex items-center gap-1.5 hover:text-[#9F5F6E] transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-[#9F5F6E]" />
                    <span>{post.commentsCount} comments</span>
                  </button>
                </div>

                <button
                  onClick={() => onOpenAiChat(`What does medical research say about this question asked in the community: "${post.title}"?`)}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#9F5F6E] hover:underline"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Ask AI Fact-Check</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Post */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-[#E9DFDC] shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-[#352F35]">Share with MomCare Circle</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#766D72]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#766D72] mb-1 font-medium">Topic Category</label>
                <select
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value as any)}
                  className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-3 py-2 text-xs text-[#352F35]"
                >
                  <option value="Baby movement">Baby movement</option>
                  <option value="Sleep">Sleep</option>
                  <option value="Food">Food</option>
                  <option value="Emotional wellbeing">Emotional wellbeing</option>
                  <option value="Appointments">Appointments</option>
                  <option value="Preparing for baby">Preparing for baby</option>
                  <option value="General experiences">General experiences</option>
                </select>
              </div>

              <div>
                <label className="block text-[#766D72] mb-1 font-medium">Post Title / Question</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Any advice for sleeping comfortably in Week 28?"
                  className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-3 py-2 text-xs text-[#352F35]"
                />
              </div>

              <div>
                <label className="block text-[#766D72] mb-1 font-medium">Details & Experience</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share what you've noticed or ask other mothers who have been there..."
                  className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-3 py-2 text-xs text-[#352F35]"
                />
              </div>

              {/* Privacy Choices (Section 27) */}
              <div>
                <label className="block text-[#766D72] mb-1 font-medium">Post as</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPrivacyChoice('name')}
                    className={`py-1.5 rounded-xl border text-[11px] ${
                      privacyChoice === 'name' ? 'bg-[#F2E1E3] border-[#C98291] font-semibold text-[#9F5F6E]' : 'bg-[#FCF8F6] border-[#E9DFDC]'
                    }`}
                  >
                    First Name
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrivacyChoice('mom')}
                    className={`py-1.5 rounded-xl border text-[11px] ${
                      privacyChoice === 'mom' ? 'bg-[#F2E1E3] border-[#C98291] font-semibold text-[#9F5F6E]' : 'bg-[#FCF8F6] border-[#E9DFDC]'
                    }`}
                  >
                    Mom of Baby
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrivacyChoice('anonymous')}
                    className={`py-1.5 rounded-xl border text-[11px] ${
                      privacyChoice === 'anonymous' ? 'bg-[#F2E1E3] border-[#C98291] font-semibold text-[#9F5F6E]' : 'bg-[#FCF8F6] border-[#E9DFDC]'
                    }`}
                  >
                    Anonymous
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 rounded-xl border border-[#E9DFDC] text-[#766D72]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPost}
                  className="flex-1 py-2 rounded-xl bg-[#9F5F6E] text-white font-semibold disabled:opacity-50"
                >
                  {isSubmittingPost ? 'Posting...' : 'Share to Circle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Comments */}
      {viewingCommentsPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-[#E9DFDC] shadow-xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DFDC]">
              <div>
                <h3 className="font-bold text-sm text-[#352F35]">Comments & Discussion</h3>
                <p className="text-[11px] text-[#766D72] line-clamp-1">{viewingCommentsPost.title}</p>
              </div>
              <button onClick={() => setViewingCommentsPost(null)} className="text-[#766D72]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {isLoadingComments ? (
                <div className="text-center py-6 text-xs text-[#766D72]">Loading comments...</div>
              ) : commentsList.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#766D72]">
                  No comments yet. Share warm thoughts or advice!
                </div>
              ) : (
                commentsList.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-[#FCF8F6] border border-[#E9DFDC]/60 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#352F35]">{c.authorDisplayName}</span>
                      <span className="text-[#766D72]">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[#352F35] leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="pt-2 border-t border-[#E9DFDC] flex gap-2">
              <input
                type="text"
                required
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a supportive reply..."
                className="flex-1 bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-3 py-2 text-xs text-[#352F35] focus:outline-hidden focus:border-[#C98291]"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-xl bg-[#9F5F6E] text-white flex items-center justify-center hover:bg-[#8C5361] transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Report Post */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 border border-[#E9DFDC] shadow-xl space-y-3">
            <h3 className="font-bold text-sm text-[#352F35]">Report Inappropriate Content</h3>
            <p className="text-xs text-[#766D72]">
              Help maintain a medically-responsible, kind, and supportive environment for all mothers.
            </p>
            <textarea
              rows={3}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Why are you reporting this? (e.g. dangerous unverified medical claim, harassment, spam)"
              className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-3 py-2 text-xs text-[#352F35]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReportingPostId(null)}
                className="flex-1 py-2 rounded-xl border border-[#E9DFDC] text-xs text-[#766D72]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendReport}
                className="flex-1 py-2 rounded-xl bg-[#C96B6B] text-white text-xs font-semibold"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
