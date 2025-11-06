"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ThumbsUp, Plus } from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/Button";
import DashboardHeaderText from "@/components/ui/DashboardHeaderText";
import { Input } from "@/components/ui/Input";
import { FeatureRequest } from "@/types/feature-requests";

function FeatureRequestsList() {
  const queryClient = useQueryClient();

  const { data: featureRequests = [], isLoading } = useQuery<FeatureRequest[]>({
    queryKey: ["feature-requests"],
    queryFn: async () => {
      const response = await fetch("/api/feature-requests");
      if (!response.ok) throw new Error("Failed to fetch feature requests");
      return response.json();
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/feature-requests/${id}/vote`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to upvote");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-requests"] });
    },
  });

  const downvoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/feature-requests/${id}/vote`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to downvote");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-requests"] });
    },
  });

  const handleUpvote = (id: string) => {
    upvoteMutation.mutate(id);
  };

  const handleDownvote = (id: string) => {
    downvoteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div
        className="bg-white rounded-xl p-4 sm:p-6 border"
        style={{ borderColor: "#e5e7eb" }}
      >
        <div className="text-center py-8 text-gray-500">Loading...</div>
      </div>
    );
  }

  if (featureRequests.length === 0) {
    return (
      <div
        className="bg-white rounded-xl p-4 sm:p-6 border"
        style={{ borderColor: "#e5e7eb" }}
      >
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No feature requests yet</p>
          <p className="text-sm text-gray-400">
            Be the first to suggest a feature!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {featureRequests.map((request) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl p-4 sm:p-6 border"
            style={{ borderColor: "#e5e7eb" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {request.title}
                </h3>
                <p className="text-gray-600 mb-4">{request.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleUpvote(request.id)}
                  disabled={
                    upvoteMutation.isPending || downvoteMutation.isPending
                  }
                  className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  <ThumbsUp className="w-5 h-5" />
                </button>
                <span className="text-sm font-semibold">{request.votes}</span>
                <button
                  onClick={() => handleDownvote(request.id)}
                  disabled={
                    upvoteMutation.isPending || downvoteMutation.isPending
                  }
                  className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 rotate-180"
                >
                  <ThumbsUp className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function AddFeatureRequestForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/feature-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      if (!response.ok) throw new Error("Failed to create feature request");

      setTitle("");
      setDescription("");
      onSuccess();
    } catch (error) {
      console.error("Error creating feature request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-4 sm:p-6 border mb-6"
      style={{ borderColor: "#e5e7eb" }}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Suggest a Feature
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What feature would you like to see?"
            required
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us more about this feature..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 min-h-[100px]"
            required
          />
        </div>
        <Button
          type="submit"
          variant="secondary"
          disabled={isSubmitting || !title.trim() || !description.trim()}
          loading={isSubmitting}
        >
          <Plus className="w-4 h-4" />
          Submit Feature Request
        </Button>
      </form>
    </motion.div>
  );
}

export default function FeatureRequestsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["feature-requests"] });
  };

  return (
    <div className="relative flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsSidebarOpen(false);
          }}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:static inset-y-0 left-0 z-50 lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <DashboardHeaderText title="Feature Requests" />
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Feature Requests
              </h1>
              <p className="text-gray-600">
                Have an idea? Share it with us! Vote on features you&apos;d like
                to see implemented.
              </p>
            </div>

            <AddFeatureRequestForm onSuccess={handleSuccess} />
            <FeatureRequestsList />
          </div>
        </main>
      </div>
    </div>
  );
}
