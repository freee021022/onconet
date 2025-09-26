import { Link } from 'wouter';
import { ForumCategory as ForumCategoryType } from '@shared/schema';

interface ForumCategoryProps {
  category: ForumCategoryType;
}

const ForumCategory = ({ category }: ForumCategoryProps) => {
  return (
    <li>
      <Link href={`/forum/categories/${category.slug}`}>
        <a className="flex items-center justify-between p-3 hover:bg-neutral-50 rounded-md transition group">
          <span className="font-medium text-neutral-700 group-hover:text-primary">{category.name}</span>
          <span className="bg-primary-100 text-primary px-2 py-1 rounded-full text-xs">
            {category.postCount} post
          </span>
        </a>
      </Link>
    </li>
  );
};

export default ForumCategory;
