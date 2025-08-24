import React from "react";
import ResourceCard from "./ResourceCard.jsx";

export default function ResourceGrid({ items, bookmarkedIds, onBookmark, onUnbookmark }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((item) => (
        <ResourceCard
          key={item.id}
          item={item}
          isBookmarked={bookmarkedIds?.has(item.id)}
          onBookmark={onBookmark}
          onUnbookmark={onUnbookmark}
        />
      ))}
    </div>
  );
}
