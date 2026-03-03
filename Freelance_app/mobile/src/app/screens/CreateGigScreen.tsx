import { useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import { useHistory } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { PageTransition } from "../components/PageTransition";
import { BottomNavigation } from "../components/BottomNavigation";
import { apiCreateJob } from "../api";
import { useRole } from "../context/RoleContext";

export function CreateGigScreen() {
  const history = useHistory();
  const { accessToken } = useRole();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [tags, setTags] = useState<string[]>(["React", "Design"]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSaveDraft = () => {
    history.push("/gigs");
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !price) {
      setError("Title, description, and price are required.");
      return;
    }

    const budgetNum = parseFloat(price);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await apiCreateJob(accessToken!, {
        title: title.trim(),
        description: description.trim(),
        budget: budgetNum,
        skills_required: tags.join(", "),
        duration: category || undefined,
      });
      history.push("/gigs");
    } catch (err: any) {
      setError(err.message || "Failed to create gig. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="h-screen bg-gray-50 flex flex-col max-w-md mx-auto overflow-hidden">
        {/* Status bar */}
        <div className="h-6 bg-white" />

        {/* Top app bar */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button onClick={() => history.goBack()} className="p-2 -ml-2">
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Create New Service</h1>
          </div>
          <button onClick={handleSubmit} className="p-2 hover:bg-gray-100 rounded-full">
            <Save className="w-5 h-5 text-[#8B5CF6]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <form className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-900">
                Gig Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., I will design a professional logo"
                className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg focus:border-[#8B5CF6] focus:ring-0"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-900">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your service in detail..."
                className="w-full min-h-32 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#8B5CF6] focus:ring-0 resize-none"
              />
              <p className="text-xs text-gray-500">{description.length} / 500 characters</p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-900">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full h-12 border-2 border-gray-300 rounded-lg focus:border-[#8B5CF6]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="design">Design & Creative</SelectItem>
                  <SelectItem value="development">Development & IT</SelectItem>
                  <SelectItem value="writing">Writing & Translation</SelectItem>
                  <SelectItem value="marketing">Marketing & Sales</SelectItem>
                  <SelectItem value="video">Video & Animation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium text-gray-900">
                Price <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
                  $
                </span>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-12 pl-8 pr-4 border-2 border-gray-300 rounded-lg focus:border-[#8B5CF6] focus:ring-0"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-sm font-medium text-gray-900">
                Tags
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-[#8B5CF6] rounded-full text-sm font-medium border border-purple-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  placeholder="Add a tag..."
                  className="flex-1 h-10 px-3 border-2 border-gray-300 rounded-lg focus:border-[#8B5CF6] focus:ring-0"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-4 mb-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Bottom buttons */}
        <div className="px-4 py-4 border-t border-gray-200 space-y-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 bg-[#8B5CF6] text-white rounded-lg font-medium hover:bg-[#7C3AED] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</>
            ) : "Submit for Review"}
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={loading}
            className="w-full h-12 bg-white text-gray-700 rounded-lg font-medium border-2 border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            Save as Draft
          </button>
        </div>

        <BottomNavigation />
      </div>
    </PageTransition>
  );
}
