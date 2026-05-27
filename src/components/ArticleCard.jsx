import { formatDistanceToNow } from 'date-fns'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { useFeeds } from '../contexts/FeedsContext'

export function ArticleCard({ article, isRead, onMarkRead, onMarkUnread }) {
  const { feeds } = useFeeds()
  const feed = feeds.find((f) => f.id === article.feedId)

  const pubDate = article.pubDate
    ? formatDistanceToNow(new Date(article.pubDate), { addSuffix: true })
    : ''

  return (
    <article
      className={`rounded-xl border p-4 transition-all hover:shadow-md cursor-pointer select-none ${
        isRead
          ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60 hover:opacity-80'
          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm'
      }`}
      onClick={() => {
        if (!isRead) onMarkRead(article.id)
        window.open(article.link, '_blank', 'noopener,noreferrer')
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        isRead ? onMarkUnread(article.id) : onMarkRead(article.id)
      }}
    >
      <div className="flex gap-3">
        {article.thumbnail && (
          <img
            src={article.thumbnail}
            alt=""
            className="h-16 w-16 rounded-lg object-cover shrink-0 bg-gray-100 dark:bg-gray-800"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                {!isRead && (
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                )}
                <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-gray-900 dark:text-gray-100">
                  {article.title}
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {feed?.title && <span className="font-medium">{feed.title}</span>}
                {feed?.title && pubDate && <span> · </span>}
                {pubDate}
                {article.author && <span className="ml-1">by {article.author}</span>}
              </p>
            </div>
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 p-1 rounded text-gray-400 hover:text-blue-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                if (!isRead) onMarkRead(article.id)
              }}
              title="Open in new tab"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
          </div>
          {article.summary && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 line-clamp-2">
              {article.summary}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
