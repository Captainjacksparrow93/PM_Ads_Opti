"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload, Search, ImageIcon, Video, FileText, Bot, Star,
  Plus, MoreVertical, Sparkles, Tag, Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useClient } from "@/components/providers/client-provider";
import { MOCK_ASSETS } from "@/lib/mock-data";
import { cn, truncate } from "@/lib/utils";
import { toast } from "sonner";
import type { Asset, AssetType } from "@/types";

const TYPE_ICON: Record<AssetType, React.ElementType> = {
  image: ImageIcon,
  video: Video,
  copy: FileText,
};

const TYPE_COLOR: Record<AssetType, string> = {
  image: "text-blue-600 bg-blue-50",
  video: "text-purple-600 bg-purple-50",
  copy: "text-amber-600 bg-amber-50",
};

function ScorePill({ score }: { score: number }) {
  const color = score >= 85 ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
    score >= 70 ? "text-amber-700 bg-amber-50 border-amber-200" : "text-red-600 bg-red-50 border-red-200";
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border", color)}>
      <Star className="w-2.5 h-2.5" /> {score}
    </span>
  );
}

function AssetCard({ asset }: { asset: Asset }) {
  const Icon = TYPE_ICON[asset.type];
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden">
      {/* Preview area */}
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        {asset.type === "image" && asset.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.thumbnail_url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : asset.type === "video" && asset.thumbnail_url ? (
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.thumbnail_url} alt={asset.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                <Video className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <span className="absolute bottom-2 right-2 text-xs font-medium text-white bg-black/60 px-1.5 py-0.5 rounded">
              {asset.duration}s
            </span>
          </div>
        ) : asset.type === "copy" ? (
          <div className="absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-50">
            <p className="text-sm text-slate-700 text-center leading-relaxed font-medium">
              &ldquo;{truncate(asset.content ?? "", 100)}&rdquo;
            </p>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="w-10 h-10 text-slate-300" />
          </div>
        )}

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          {asset.ai_generated && (
            <span className="flex items-center gap-1 text-[10px] font-semibold bg-violet-600 text-white px-2 py-0.5 rounded-full">
              <Bot className="w-2.5 h-2.5" /> AI
            </span>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-white text-xs font-medium">{asset.usage_count} campaigns</span>
          </div>
        </div>
      </div>

      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{asset.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={cn("flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md", TYPE_COLOR[asset.type])}>
                <Icon className="w-3 h-3" />
                {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
              </span>
              {asset.performance_score && <ScorePill score={asset.performance_score} />}
            </div>
          </div>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {asset.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">#{tag}</span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function UploadZone({ onUpload }: { onUpload: (files: File[]) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onUpload,
    accept: { "image/*": [], "video/*": [] },
    maxFiles: 10,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
        isDragActive
          ? "border-violet-500 bg-violet-50"
          : "border-slate-200 hover:border-violet-300 hover:bg-slate-50"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div className={cn("p-4 rounded-2xl transition-colors", isDragActive ? "bg-violet-100" : "bg-slate-100")}>
          <Upload className={cn("w-6 h-6", isDragActive ? "text-violet-600" : "text-slate-400")} />
        </div>
        <div>
          <p className="font-semibold text-slate-700">
            {isDragActive ? "Drop to upload" : "Drag & drop files here"}
          </p>
          <p className="text-sm text-slate-500 mt-0.5">Images (JPG, PNG, WebP) or Videos (MP4, MOV)</p>
        </div>
        <Button variant="outline" size="sm" className="mt-1">Browse files</Button>
        <p className="text-xs text-slate-400">Max 50 assets per client · Up to 500MB per file</p>
      </div>
    </div>
  );
}

export default function AssetsPage() {
  const { selectedClient } = useClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AssetType | "all">("all");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genPrompt, setGenPrompt] = useState("");

  const assets = MOCK_ASSETS.filter((a) => {
    const matchClient = !selectedClient || a.client_id === selectedClient.id;
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.includes(search.toLowerCase()));
    const matchType = typeFilter === "all" || a.type === typeFilter;
    return matchClient && matchSearch && matchType;
  });

  const handleUpload = (files: File[]) => {
    toast.success(`Uploading ${files.length} file${files.length > 1 ? "s" : ""}…`);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(false);
    setGenerateOpen(false);
    toast.success("AI generated 3 copy variants! Check the Assets library.");
  };

  const counts = {
    all: MOCK_ASSETS.length,
    image: MOCK_ASSETS.filter((a) => a.type === "image").length,
    video: MOCK_ASSETS.filter((a) => a.type === "video").length,
    copy: MOCK_ASSETS.filter((a) => a.type === "copy").length,
  };

  return (
    <div className="max-w-[1400px] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search assets or tags…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-56 h-9 text-sm" />
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(["all", "image", "video", "copy"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={cn("px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize", typeFilter === f ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700")}
              >
                {f === "all" ? `All (${counts.all})` : `${f.charAt(0).toUpperCase() + f.slice(1)}s (${counts[f]})`}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setGenerateOpen(true)} className="gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-violet-600" />
            AI Generate Copy
          </Button>
        </div>
      </div>

      {/* Upload zone */}
      <UploadZone onUpload={handleUpload} />

      {/* Pool usage */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-slate-600 font-medium">
          {assets.length} / 50 assets in pool
        </p>
        <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(assets.length / 50) * 100}%` }} />
        </div>
      </div>

      {/* Asset grid */}
      {assets.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No assets found</p>
          <p className="text-sm mt-1">Upload assets or adjust your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {assets.map((asset) => <AssetCard key={asset.id} asset={asset} />)}
        </div>
      )}

      {/* AI Generate Copy Dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              AI Copy Generator
            </DialogTitle>
            <DialogDescription>
              Describe what you need and the AI will create ad headlines, primary text, and descriptions tailored to your brand and campaign objective.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">What do you want to promote?</label>
              <textarea
                rows={3}
                value={genPrompt}
                onChange={(e) => setGenPrompt(e.target.value)}
                placeholder="e.g. New running shoe collection launch, targeting fitness enthusiasts aged 25-40, focus on lightweight design and performance…"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Copy type</label>
              <div className="grid grid-cols-3 gap-2">
                {["Headlines", "Primary Text", "Descriptions"].map((t) => (
                  <button key={t} className="p-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Tone</label>
              <div className="grid grid-cols-3 gap-2">
                {["Energetic", "Professional", "Friendly"].map((t) => (
                  <button key={t} className="p-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={generating || !genPrompt} className="bg-violet-600 hover:bg-violet-500 gap-2">
              {generating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate 3 Variants</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
