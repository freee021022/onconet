import { Link } from 'wouter';
import { useTranslation } from '@/hooks/use-translation';
import ForumCategory from '../forum/ForumCategory';
import ForumPost from '../forum/ForumPost';
import { Button } from '@/components/ui/button';
import { ForumCategory as ForumCategoryType, ForumPost as ForumPostType } from '@shared/schema';
import { useAuth } from '@/context/AuthContext';

interface ForumSectionProps {
  categories: ForumCategoryType[];
  posts: ForumPostType[];
}

const ForumSection = ({ categories, posts }: ForumSectionProps) => {
  const { t } = useTranslation();
  
  // Safely use auth context with fallback values
  let isAuthenticated = false;
  
  try {
    const authContext = useAuth();
    isAuthenticated = authContext.isAuthenticated;
  } catch (error) {
    console.error('Auth context not available in ForumSection');
  }
  
  // Sort posts by created date (newest first)
  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }).slice(0, 3); // Take only the first 3 posts
  
  return (
    <section id="forum" className="py-12 md:py-20 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 mb-10 md:mb-0 md:pr-12">
            <h2 className="text-3xl font-bold mb-6 section-title">{t('forum.title')}</h2>
            <p className="text-neutral-600 mb-6">{t('forum.description')}</p>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold mb-4">{t('forum.categories')}</h3>
              <ul className="space-y-3">
                {categories.map((category) => (
                  <ForumCategory key={category.id} category={category} />
                ))}
              </ul>
            </div>
          </div>
          <div className="md:w-2/3">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">{t('forum.recentDiscussions')}</h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="bg-white border border-neutral-200 px-4 py-2 rounded-md text-neutral-600 text-sm hover:bg-neutral-50"
                >
                  {t('forum.filter')}
                  <span className="material-icons text-sm ml-1">filter_list</span>
                </Button>
                <Link href={isAuthenticated ? "/forum/new" : "/login"}>
                  <Button
                    className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-primary/90"
                  >
                    <span className="material-icons text-sm mr-1">add</span>
                    {t('forum.newPost')}
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="space-y-4">
              {sortedPosts.length > 0 ? (
                sortedPosts.map((post) => (
                  <ForumPost key={post.id} post={post} />
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p>{t('forum.noPosts')}</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 text-center">
              <Link href="/forum">
                <Button
                  variant="outline"
                  className="bg-white border border-neutral-200 px-6 py-3 rounded-md text-neutral-700 font-medium hover:bg-neutral-50"
                >
                  {t('forum.loadMore')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForumSection;
