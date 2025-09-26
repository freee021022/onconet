import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ForumPost as ForumPostType } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/use-translation';
import { Skeleton } from '@/components/ui/skeleton';

interface ForumPostProps {
  post: ForumPostType;
}

const ForumPost = ({ post }: ForumPostProps) => {
  const { t } = useTranslation();
  const [categoryName, setCategoryName] = useState<string>('');
  const [userData, setUserData] = useState<any>(null);
  const [timeAgo, setTimeAgo] = useState<string>('');

  // Fetch category
  const { data: categoryData, isLoading: isLoadingCategory } = useQuery({
    queryKey: ['/api/forum/categories'],
    queryFn: async () => {
      const response = await fetch('/api/forum/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    }
  });

  // Fetch user
  const { data: userData2, isLoading: isLoadingUser } = useQuery({
    queryKey: [`/api/users/${post.userId}`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${post.userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    }
  });

  useEffect(() => {
    if (categoryData) {
      const category = categoryData.find((cat: any) => cat.id === post.categoryId);
      if (category) {
        setCategoryName(category.name);
      }
    }
  }, [categoryData, post.categoryId]);

  useEffect(() => {
    if (userData2) {
      setUserData(userData2);
    }
  }, [userData2]);

  useEffect(() => {
    // Calculate time ago
    const now = new Date();
    const postDate = new Date(post.createdAt);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      setTimeAgo(t('forum.post.timeAgo.seconds', { count: diffInSeconds }));
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      setTimeAgo(t('forum.post.timeAgo.minutes', { count: minutes }));
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      setTimeAgo(t('forum.post.timeAgo.hours', { count: hours }));
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      setTimeAgo(t('forum.post.timeAgo.days', { count: days }));
    }
  }, [post.createdAt, t]);

  if (isLoadingCategory || isLoadingUser) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <Skeleton className="w-10 h-10 rounded-full mr-3" />
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-6 w-4/5 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <img 
            src={userData?.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40&q=80"} 
            alt={`${userData?.fullName || 'User'} avatar`} 
            className="w-10 h-10 rounded-full mr-3" 
          />
          <div>
            <h4 className="font-bold text-neutral-800">{userData?.fullName || 'Unknown User'}</h4>
            <p className="text-xs text-neutral-500">
              {userData?.isDoctor ? t('forum.post.doctor') : t('forum.post.patient')} • {timeAgo}
            </p>
          </div>
        </div>
        <span className="bg-primary-100 text-primary px-2 py-1 rounded-full text-xs">
          {categoryName}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-2">{post.title}</h3>
      <p className="text-neutral-600 mb-4">
        {post.content.length > 150 
          ? `${post.content.substring(0, 150)}...` 
          : post.content}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <span className="flex items-center text-neutral-500 text-sm">
            <span className="material-icons text-sm mr-1">comment</span>
            {post.commentCount} {t('forum.post.comments')}
          </span>
          <span className="flex items-center text-neutral-500 text-sm">
            <span className="material-icons text-sm mr-1">visibility</span>
            {post.viewCount} {t('forum.post.views')}
          </span>
        </div>
        <Link href={`/forum/posts/${post.id}`}>
          <button className="text-primary flex items-center text-sm hover:text-primary/80">
            {t('forum.post.readMore')}
            <span className="material-icons text-sm ml-1">arrow_forward</span>
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ForumPost;
