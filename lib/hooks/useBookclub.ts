import { useState, useEffect, useCallback } from "react";
import { BookclubData } from "@/types/bookclub";
import { BookReview } from "@/types/reviews";
import * as bookclubService from "@/lib/services/bookclub";

export function useBookclub(initialBookId?: number) {
  const [bookData, setBookData] = useState<BookclubData | null>(null);
  const [allBooks, setAllBooks] = useState<BookclubData[]>([]);
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [loading, setLoading] = useState({
    books: true,
    currentBook: initialBookId ? true : false,
    reviews: initialBookId ? true : false,
  });
  const [error, setError] = useState<Error | null>(null);

  // 加载所有书籍数据
  const loadAllBooks = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, books: true }));
      const data = await bookclubService.fetchAllBookclubData();
      setAllBooks(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return [];
    } finally {
      setLoading((prev) => ({ ...prev, books: false }));
    }
  }, []);

  // 加载特定书籍
  const loadBook = useCallback(async (id: number) => {
    try {
      setLoading((prev) => ({ ...prev, currentBook: true }));
      const data = await bookclubService.fetchBookclubById(id);
      setBookData(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setLoading((prev) => ({ ...prev, currentBook: false }));
    }
  }, []);

  // 加载书评
  const loadReviews = useCallback(async (bookId: number) => {
    try {
      setLoading((prev) => ({ ...prev, reviews: true }));
      const data = await bookclubService.fetchBookReviews(bookId);
      setReviews(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return [];
    } finally {
      setLoading((prev) => ({ ...prev, reviews: false }));
    }
  }, []);

  // 添加评论
  const addReview = useCallback(
    async (bookId: number, reviewer: string, review: string) => {
      try {
        const newReview = await bookclubService.createBookReview(
          bookId,
          reviewer,
          review
        );
        setReviews((prev) => [newReview, ...prev]);
        return newReview;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    []
  );

  // 更新评论
  const updateReview = useCallback(
    async (reviewId: number, reviewer: string, review: string) => {
      try {
        const updatedReview = await bookclubService.updateBookReview(
          reviewId,
          reviewer,
          review
        );
        setReviews((prev) =>
          prev.map((review) =>
            review.id === reviewId ? updatedReview : review
          )
        );
        return updatedReview;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    []
  );

  // 删除评论
  const deleteReview = useCallback(async (reviewId: number) => {
    try {
      await bookclubService.deleteBookReview(reviewId);
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }, []);

  // 初始加载
  useEffect(() => {
    async function initialize() {
      const books = await loadAllBooks();

      if (initialBookId) {
        await loadBook(initialBookId);
        await loadReviews(initialBookId);
      } else if (books.length > 0) {
        setBookData(books[0]);
        await loadReviews(books[0].id);
      }
    }

    initialize();
  }, [initialBookId, loadAllBooks, loadBook, loadReviews]);

  const isLoading = loading.books || loading.currentBook || loading.reviews;

  return {
    bookData,
    allBooks,
    reviews,
    loading: isLoading,
    loadingState: loading,
    error,
    loadBook,
    loadAllBooks,
    loadReviews,
    addReview,
    updateReview,
    deleteReview,
  };
}
