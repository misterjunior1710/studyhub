import { memo, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import StudyPost from "@/components/StudyPost";
import SEOHead, { StructuredData, getBreadcrumbSchema } from "@/components/SEOHead";
import { PostSkeletonList } from "@/components/PostSkeleton";
import PullToRefresh from "@/components/PullToRefresh";
import { usePosts, getTimeAgo } from "@/hooks/usePosts";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const POSTS_PER_PAGE = 10;

const Questions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const searchQuery = useDebounce(searchInput, 300);
  
  const {
    data: allPosts = [],
    isLoading: loading,
    invalidatePosts
  } = usePosts({
    postType: "doubt",
    sortBy: "new",
    searchQuery
  });

  // Paginate posts
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const posts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    return allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [allPosts, currentPage]);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push("ellipsis");
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }
      
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const breadcrumbData = getBreadcrumbSchema([{
    name: "Home",
    url: "https://studyhub.world/"
  }, {
    name: "Questions",
    url: "https://studyhub.world/questions"
  }]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Ask Homework Questions | Get Answers Free | Math Science English Help" 
        description="Ask any homework question and get free answers from students. Math homework help, science homework help, English essay help, history help. Post your question now and get help fast." 
        canonical="https://studyhub.world/questions" 
      />
      <StructuredData data={breadcrumbData} />
      
      <Navbar onPostCreated={invalidatePosts} />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent opacity-0 animate-hero-fade-up">
            Academic Questions
          </h1>
          <p className="text-muted-foreground max-w-2xl opacity-0 animate-hero-fade-up" style={{ animationDelay: "100ms" }}>
            Stuck on a problem? Post your question and get help from students around the world. 
            Whether it's calculus, chemistry, or creative writing, the community is here to help.
          </p>
          
          <div className="max-w-2xl mt-4 opacity-0 animate-hero-fade-up" style={{ animationDelay: "150ms" }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search questions, topics..."
                className="pl-10 pr-4 py-5"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search questions"
              />
            </div>
          </div>
          
          <nav className="mt-3 text-sm opacity-0 animate-hero-fade-up" style={{ animationDelay: "200ms" }} aria-label="Related pages">
            <span className="text-muted-foreground">See also: </span>
            <a href="/feed" className="text-primary hover:underline">Home Feed</a>
            <span className="text-muted-foreground mx-2">•</span>
            <a href="/groups" className="text-primary hover:underline">Study Groups</a>
            <span className="text-muted-foreground mx-2">•</span>
            <a href="/leaderboard" className="text-primary hover:underline">Leaderboard</a>
          </nav>
        </header>

        <section aria-label="Questions feed">
          <PullToRefresh onRefresh={invalidatePosts}>
            {loading ? (
              <PostSkeletonList count={4} />
            ) : allPosts.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-lg font-semibold mb-2">No questions posted yet</h2>
                <p className="text-muted-foreground mb-4">
                  Be the first to ask! Click the post button in the navigation to ask your question.
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Questions can be about any academic subject — homework help, exam preparation, 
                  concept explanations, or study strategies. The community is ready to assist.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-6">
                  {posts.map(post => (
                    <article key={post.id}>
                      <StudyPost 
                        id={post.id} 
                        title={post.title} 
                        content={post.content} 
                        author={post.profiles?.username ?? "Anonymous"} 
                        authorId={post.user_id} 
                        upvotes={post.upvotes} 
                        downvotes={post.downvotes} 
                        comments={Array.isArray(post.comments) ? post.comments.length : 0} 
                        subject={post.subject} 
                        grade={post.grade} 
                        stream={post.stream} 
                        country={post.country} 
                        timeAgo={getTimeAgo(post.created_at)} 
                        fileUrl={post.file_url ?? undefined} 
                        onVoteChange={invalidatePosts} 
                      />
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {getPageNumbers().map((page, index) => (
                        <PaginationItem key={index}>
                          {page === "ellipsis" ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
                
                <p className="text-center text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * POSTS_PER_PAGE) + 1}-{Math.min(currentPage * POSTS_PER_PAGE, allPosts.length)} of {allPosts.length} questions
                </p>
              </div>
            )}
          </PullToRefresh>
        </section>
      </main>
    </div>
  );
};

export default memo(Questions);
