import Navbar from "@/components/Navbar";
import FilterSidebar from "@/components/FilterSidebar";
import StudyPost from "@/components/StudyPost";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, Star } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Index = () => {
  const samplePosts = [
    {
      id: "1",
      title: "How to solve quadratic equations with complex roots?",
      content: "I'm struggling with understanding how to handle quadratic equations when the discriminant is negative. Can someone explain the concept of complex roots and provide some examples?",
      author: "mathstudent123",
      upvotes: 42,
      comments: 18,
      subject: "Mathematics",
      grade: "Grade 11",
      stream: "CBSE",
      country: "India",
      timeAgo: "2 hours ago",
    },
    {
      id: "2",
      title: "Need help with Newton's Laws of Motion practical applications",
      content: "We have an exam coming up on Newton's Laws. I understand the theory but struggle with real-world problem-solving. Any tips or resources?",
      author: "physicslover",
      upvotes: 35,
      comments: 12,
      subject: "Physics",
      grade: "Grade 10",
      stream: "IGCSE",
      country: "United Kingdom",
      timeAgo: "4 hours ago",
    },
    {
      id: "3",
      title: "Best way to memorize organic chemistry reactions?",
      content: "There are so many reactions in organic chemistry! What techniques do you use to remember reaction mechanisms and conditions?",
      author: "chemwhiz",
      upvotes: 28,
      comments: 23,
      subject: "Chemistry",
      grade: "Grade 12",
      stream: "AP",
      country: "United States",
      timeAgo: "5 hours ago",
    },
    {
      id: "4",
      title: "Can someone explain photosynthesis in simple terms?",
      content: "I'm having trouble understanding the light-dependent and light-independent reactions. Looking for a clear explanation with examples.",
      author: "biogeek",
      upvotes: 51,
      comments: 15,
      subject: "Biology",
      grade: "Grade 10",
      stream: "CBSE",
      country: "India",
      timeAgo: "7 hours ago",
    },
    {
      id: "5",
      title: "Data structures vs algorithms - which to learn first?",
      content: "I'm new to computer science and wondering if I should master data structures before algorithms or learn them together?",
      author: "coder101",
      upvotes: 38,
      comments: 27,
      subject: "Computer Science",
      grade: "Undergraduate",
      stream: "University",
      country: "Canada",
      timeAgo: "8 hours ago",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div 
        className="relative h-48 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Study Together, Learn Better
          </h1>
          <p className="text-white/90 text-lg">
            Connect with students worldwide, share knowledge, and ace your exams
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <FilterSidebar />
          
          <main className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="default" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Hot
                </Button>
                <Button variant="ghost" className="gap-2">
                  <Clock className="h-4 w-4" />
                  New
                </Button>
                <Button variant="ghost" className="gap-2">
                  <Star className="h-4 w-4" />
                  Top
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {samplePosts.map((post) => (
                <StudyPost key={post.id} {...post} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
