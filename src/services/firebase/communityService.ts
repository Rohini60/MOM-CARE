import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  increment,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { sanitizeForFirestore } from './sanitize';
import type { CommunityPost, CommunityComment, CommunityTopic } from '../../types';

const DEMO_POSTS_STORAGE = 'momcare_demo_community_posts';

function getLocalCommunityPosts(): CommunityPost[] {
  try {
    const raw = localStorage.getItem(DEMO_POSTS_STORAGE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(e);
  }
  const seeded = INITIAL_COMMUNITY_POSTS.map((p, i) => ({
    ...p,
    id: `seed_post_${i + 1}`,
    createdAt: new Date(Date.now() - (i + 1) * 3600000 * 6).toISOString(),
  }));
  try {
    localStorage.setItem(DEMO_POSTS_STORAGE, JSON.stringify(seeded));
  } catch {}
  return seeded;
}

function saveLocalCommunityPosts(posts: CommunityPost[]) {
  try {
    localStorage.setItem(DEMO_POSTS_STORAGE, JSON.stringify(posts));
  } catch {}
}

export async function getCommunityPosts(topic?: string): Promise<CommunityPost[]> {
  const path = 'community_posts';
  try {
    const q = query(
      collection(db, 'community_posts'),
      orderBy('createdAt', 'desc'),
      limit(25)
    );
    const snap = await getDocs(q);
    let posts = snap.docs.map(d => d.data() as CommunityPost);

    if (posts.length === 0) {
      posts = getLocalCommunityPosts();
    }

    if (topic && topic !== 'All') {
      posts = posts.filter(p => p.topic === topic);
    }
    return posts;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    const local = getLocalCommunityPosts();
    return topic && topic !== 'All' ? local.filter(p => p.topic === topic) : local;
  }
}

export async function createCommunityPost(post: CommunityPost): Promise<void> {
  if (!auth.currentUser) {
    const local = getLocalCommunityPosts();
    local.unshift(post);
    saveLocalCommunityPosts(local);
    return;
  }
  const path = `community_posts/${post.id}`;
  try {
    const cleanData = sanitizeForFirestore(post);
    await setDoc(doc(db, 'community_posts', post.id), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function likeCommunityPost(postId: string): Promise<void> {
  if (!auth.currentUser) {
    const local = getLocalCommunityPosts();
    const p = local.find(x => x.id === postId);
    if (p) {
      p.likesCount += 1;
      saveLocalCommunityPosts(local);
    }
    return;
  }
  const path = `community_posts/${postId}`;
  try {
    const cleanData = sanitizeForFirestore({
      likesCount: increment(1),
    });
    await updateDoc(doc(db, 'community_posts', postId), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function getPostComments(postId: string): Promise<CommunityComment[]> {
  const path = `community_posts/${postId}/comments`;
  try {
    const q = query(
      collection(db, 'community_posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as CommunityComment);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function addPostComment(comment: CommunityComment): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  const path = `community_posts/${comment.postId}/comments/${comment.id}`;
  try {
    const cleanComment = sanitizeForFirestore(comment);
    await setDoc(doc(db, 'community_posts', comment.postId, 'comments', comment.id), cleanComment);
    // increment commentsCount on post
    const cleanUpdate = sanitizeForFirestore({
      commentsCount: increment(1),
    });
    await updateDoc(doc(db, 'community_posts', comment.postId), cleanUpdate);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function reportCommunityPost(postId: string, reportedBy: string, reason: string): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  const reportId = `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `community_reports/${reportId}`;
  try {
    const cleanReport = sanitizeForFirestore({
      id: reportId,
      postId,
      reportedBy,
      reason,
      createdAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'community_reports', reportId), cleanReport);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export const INITIAL_COMMUNITY_POSTS: Omit<CommunityPost, 'id' | 'createdAt'>[] = [
  {
    authorId: 'system_mom_1',
    authorDisplayName: 'Elena R.',
    authorRole: 'Week 24 • First Baby',
    week: 24,
    topic: 'Baby movement',
    title: 'Stronger kicks this week! 🥹 Anyone else experiencing this?',
    content: 'Just hit 24 weeks and yesterday after dinner baby was doing full somersaults! My partner felt it from the outside for the very first time. It brought tears to our eyes. Did your babies get noticeably more active around week 24?',
    likesCount: 18,
    commentsCount: 5,
  },
  {
    authorId: 'system_mom_2',
    authorDisplayName: 'Sarah & Little Bean',
    authorRole: 'Week 28 • Second Pregnancy',
    week: 28,
    topic: 'Sleep',
    title: 'Pregnancy pillow recommendations that actually save your hips?',
    content: 'Third trimester has officially arrived and hip pain while side sleeping is getting real. I have the U-shaped pillow but it takes up the entire bed. What setup is working best for you all?',
    likesCount: 24,
    commentsCount: 9,
  },
  {
    authorId: 'system_mom_3',
    authorDisplayName: 'Anonymous Mom',
    authorRole: 'Week 20 • First Baby',
    week: 20,
    topic: 'Appointments',
    title: '20-Week Anatomy Scan nerves turned into pure joy',
    content: 'I was so nervous leading up to the 20-week scan yesterday, but the sonographer was so gentle and walked us through every chamber of baby’s heart and tiny fingers. Everything looked healthy and reassuring. Sending hugs to anyone who has their scan coming up!',
    likesCount: 31,
    commentsCount: 6,
  },
  {
    authorId: 'system_mom_4',
    authorDisplayName: 'Clara M.',
    authorRole: 'Week 16 • Twins on the way',
    week: 16,
    topic: 'Food',
    title: 'What weird cravings are hitting you in the second trimester?',
    content: 'Watermelon with lemon juice and crushed ice! I literally cannot stop eating chilled fruit. What are your unexpected cravings?',
    likesCount: 15,
    commentsCount: 12,
  },
];
