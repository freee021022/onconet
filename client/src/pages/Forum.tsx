import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/use-translation';
import { ForumPost, ForumCategory } from '@shared/schema';
import { default as ForumCategoryComponent } from '@/components/forum/ForumCategory';
import { default as ForumPostComponent } from '@/components/forum/ForumPost';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';

const Forum = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Get forum categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/forum/categories'],
    queryFn: async () => {
      const response = await fetch('/api/forum/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json() as Promise<ForumCategory[]>;
    }
  });

  // Get forum posts filtered by category if selected
  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: selectedCategory ? 
      [`/api/forum/posts?categoryId=${selectedCategory}`] : 
      ['/api/forum/posts'],
    queryFn: async () => {
      const url = selectedCategory ? 
        `/api/forum/posts?categoryId=${selectedCategory}` : 
        '/api/forum/posts';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      return response.json() as Promise<ForumPost[]>;
    }
  });

  // Sort posts by created date (newest first)
  const sortedPosts = posts ? [...posts].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }) : [];

  return (
    <div className="py-12 md:py-20 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{t('forum.pageTitle')}</h1>
          <p className="text-lg text-neutral-600 max-w-3xl">{t('forum.pageDescription')}</p>
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 mb-10 md:mb-0 md:pr-12">
            <h2 className="text-2xl font-bold mb-6 section-title">{t('forum.categories')}</h2>
            
            {isLoadingCategories ? (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">{t('forum.categoriesList')}</h3>
                <ul className="space-y-3">
                  <li>
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      className={`flex items-center justify-between p-3 w-full text-left hover:bg-neutral-50 rounded-md transition group ${!selectedCategory ? 'bg-neutral-50' : ''}`}
                    >
                      <span className={`font-medium ${!selectedCategory ? 'text-primary' : 'text-neutral-700 group-hover:text-primary'}`}>
                        {t('forum.allCategories')}
                      </span>
                    </button>
                  </li>
                  {categories?.map((category) => (
                    <li key={category.id}>
                      <button 
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center justify-between p-3 w-full text-left hover:bg-neutral-50 rounded-md transition group ${selectedCategory === category.id ? 'bg-neutral-50' : ''}`}
                      >
                        <span className={`font-medium ${selectedCategory === category.id ? 'text-primary' : 'text-neutral-700 group-hover:text-primary'}`}>
                          {category.name}
                        </span>
                        <span className="bg-primary-100 text-primary px-2 py-1 rounded-full text-xs">
                          {category.postCount} post
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold mb-4">{t('forum.guidelines')}</h3>
              <ul className="space-y-3 text-neutral-600 text-sm">
                <li className="flex items-start">
                  <span className="material-icons text-primary text-base mr-2 flex-shrink-0">check_circle</span>
                  <span>{t('forum.guidelines.respect')}</span>
                </li>
                <li className="flex items-start">
                  <span className="material-icons text-primary text-base mr-2 flex-shrink-0">check_circle</span>
                  <span>{t('forum.guidelines.personal')}</span>
                </li>
                <li className="flex items-start">
                  <span className="material-icons text-primary text-base mr-2 flex-shrink-0">check_circle</span>
                  <span>{t('forum.guidelines.medical')}</span>
                </li>
                <li className="flex items-start">
                  <span className="material-icons text-primary text-base mr-2 flex-shrink-0">check_circle</span>
                  <span>{t('forum.guidelines.support')}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="md:w-2/3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {selectedCategory && categories 
                  ? categories.find(c => c.id === selectedCategory)?.name
                  : t('forum.allDiscussions')}
              </h2>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="bg-white border border-neutral-200 px-4 py-2 rounded-md text-neutral-600 text-sm hover:bg-neutral-50"
                >
                  {t('forum.filter')}
                  <span className="material-icons text-sm ml-1">filter_list</span>
                </Button>
                {isAuthenticated ? (
                  <Link href="/forum/new-post">
                    <Button
                      className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-primary/90"
                    >
                      <span className="material-icons text-sm mr-1">add</span>
                      {t('forum.newPost')}
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button
                      className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-primary/90"
                    >
                      <span className="material-icons text-sm mr-1">login</span>
                      {t('forum.loginToPost')}
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {isLoadingPosts ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            ) : sortedPosts.length > 0 ? (
              <>
                <div className="space-y-4">
                  {sortedPosts.map((post) => (
                    <ForumPostComponent key={post.id} post={post} />
                  ))}
                </div>
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    className="bg-white border border-neutral-200 px-6 py-3 rounded-md text-neutral-700 font-medium hover:bg-neutral-50"
                  >
                    {t('forum.loadMore')}
                  </Button>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <span className="material-icons text-neutral-400 text-5xl mb-4">forum</span>
                <h3 className="text-xl font-bold mb-2">{t('forum.noPosts')}</h3>
                <p className="text-neutral-600 mb-6">{t('forum.noPostsDescription')}</p>
                {isAuthenticated ? (
                  <Link href="/forum/new">
                    <Button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
                      {t('forum.createFirstPost')}
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
                      {t('forum.loginToPost')}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forum;
