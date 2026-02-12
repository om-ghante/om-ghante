'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
import { ChevronDown, ChevronUp, Loader2, AlertCircle, Info, Code2 } from 'lucide-react';

// --- Types ---
interface ProblemContent {
    raw: string;
    tags: string[];
}

// --- Helper Components (Internal) ---

// Mermaid Block Component
const MermaidDiagram = ({ chart }: { chart: string }) => {
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!chart) return;

        // Safety check for SSR
        if (typeof window === 'undefined') return;

        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'inherit'
        });

        const renderChart = async () => {
            try {
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                // render returns { svg, bindFunctions? }
                const { svg } = await mermaid.render(id, chart);
                setSvg(svg);
                setError(false);
            } catch (err) {
                console.error("Mermaid parsing failed", err);
                setError(true);
            }
        };

        renderChart();
    }, [chart]);

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 text-sm border border-red-200 rounded font-mono break-words whitespace-pre-wrap my-4">
                <div className="font-bold mb-1 flex items-center gap-2">
                    <AlertCircle size={14} />
                    Mermaid Error
                </div>
                {chart}
            </div>
        );
    }

    if (!svg) {
        return <div className="h-24 bg-gray-50 animate-pulse rounded my-4"></div>;
    }

    return (
        <div
            className="flex justify-center p-6 bg-white rounded-lg border border-gray-100 my-6 shadow-sm overflow-x-auto not-prose"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
};

// Solution Toggle Component - Custom renderer for details tag
const SolutionToggle = (props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDetailsElement>, HTMLDetailsElement>) => {
    const [isOpen, setIsOpen] = useState(false);

    // Extract summary and content
    // When using rehype-raw, children might be mixed.
    const childrenArray = React.Children.toArray(props.children);

    // Find summary element
    const summaryElement = childrenArray.find((child: any) =>
        child.type === 'summary' || (child.props && child.props.node && child.props.node.tagName === 'summary')
    );

    // Everything else is content
    const contentComponents = childrenArray.filter((child: any) => child !== summaryElement);

    // Get title from summary or default
    let title = "Show Solution";
    if (summaryElement) {
        const summaryProps = (summaryElement as any).props;
        // Try to extract text content safely from summary children
        if (typeof summaryProps.children === 'string') {
            title = summaryProps.children;
        } else if (Array.isArray(summaryProps.children)) {
            // Flatten array of children to string if possible, or just default
            const text = summaryProps.children.map((c: any) => (typeof c === 'string' ? c : '')).join('');
            if (text) title = text;
        }
    }

    return (
        <div className="my-6 border border-blue-100 rounded-lg overflow-hidden shadow-sm bg-white not-prose">
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(!isOpen);
                }}
                className={`
          w-full flex items-center justify-between px-5 py-3 text-left font-medium transition-colors duration-200
          ${isOpen ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-700 hover:bg-gray-50'}
        `}
            >
                <span className="flex items-center gap-2">
                    <Code2 size={18} className="text-blue-500" />
                    {title}
                </span>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {isOpen && (
                <div className="p-5 bg-gray-50 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="prose prose-sm max-w-none text-gray-700">
                        {contentComponents}
                    </div>
                </div>
            )}
        </div>
    );
};

// Main Problem Viewer Component
function ProblemViewer() {
    const searchParams = useSearchParams();
    const setId = searchParams.get('set');

    const [content, setContent] = useState<ProblemContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch Logic
    useEffect(() => {
        if (!setId) {
            setError("No problem set specified. Use ?set=1");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/content/${setId}.md`);

                if (!res.ok) {
                    if (res.status === 404) throw new Error(`Problem set "${setId}" not found.`);
                    throw new Error("Failed to load problem content.");
                }

                const text = await res.text();

                // Extract Tags (Case insensitive, handle "Tag:" or "Tags:")
                let tags: string[] = [];
                let cleanText = text;

                // Regex to match "Tag: ..." or "Tags: ..." at start of line
                const tagMatch = text.match(/^Tags?:\s*(.+)$/im);

                if (tagMatch) {
                    // split by comma
                    tags = tagMatch[1].split(',').map(t => t.trim());
                    // Remove the line from the text so it doesn't render in body
                    cleanText = text.replace(tagMatch[0], '');
                }

                setContent({ raw: cleanText, tags });
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [setId]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500 font-sans">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="font-medium animate-pulse">Loading problem...</p>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 max-w-md w-full text-center">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-red-500" size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Problem</h2>
                    <p className="text-gray-600 mb-6">{error || "Problem not found."}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-gray-400 uppercase tracking-widest text-xs mb-2">Problem Set {setId}</h1>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {content.tags.map(tag => (
                                <span key={tag} className={`
                      px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                      ${tag.toLowerCase().includes('easy') || tag.toLowerCase().includes('beginner') ? 'bg-green-100 text-green-700' :
                                        tag.toLowerCase().includes('medium') || tag.toLowerCase().includes('intermediate') ? 'bg-yellow-100 text-yellow-800' :
                                            tag.toLowerCase().includes('hard') || tag.toLowerCase().includes('advanced') ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'}
                   `}>
                                    {tag}
                                </span>
                            ))}
                            {content.tags.length === 0 && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Untagged</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-10 overflow-hidden">
                    <article className="prose prose-slate max-w-none 
              prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
              prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-none prose-pre:shadow-none
              prose-img:rounded-lg prose-img:shadow-md
           ">
                        <ReactMarkdown
                            // @ts-expect-error - remarkBreaks types might not be compatible with strict mode but works at runtime
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                code({ node, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const contentStr = String(children).replace(/\n$/, '');

                                    // Robust Mermaid Detection
                                    // Check if class is mermaid OR if content looks like mermaid code
                                    const isMermaid =
                                        (match && match[1] === 'mermaid') ||
                                        contentStr.trim().startsWith('graph ') ||
                                        contentStr.trim().startsWith('flowchart ') ||
                                        contentStr.trim().startsWith('sequenceDiagram') ||
                                        contentStr.trim().startsWith('classDiagram') ||
                                        contentStr.trim().startsWith('stateDiagram') ||
                                        contentStr.trim().startsWith('erDiagram') ||
                                        contentStr.trim().startsWith('pie') ||
                                        contentStr.trim().startsWith('gantt') ||
                                        contentStr.trim().startsWith('journey') ||
                                        contentStr.trim().startsWith('gitGraph') ||
                                        contentStr.trim().startsWith('requirementDiagram');

                                    if (isMermaid) {
                                        return <MermaidDiagram chart={contentStr} />;
                                    }

                                    return match ? (
                                        <div className="relative group rounded-lg overflow-hidden border border-gray-200 my-6 shadow-sm not-prose">
                                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <div className="text-xs text-white/70 bg-black/60 px-2 py-1 rounded backdrop-blur-sm uppercase font-mono">{match[1]}</div>
                                            </div>
                                            <SyntaxHighlighter
                                                // @ts-expect-error - style type mismatch
                                                style={vscDarkPlus}
                                                language={match[1]}
                                                PreTag="div"
                                                customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.9rem', lineHeight: '1.6' }}
                                                {...props}
                                            >
                                                {contentStr}
                                            </SyntaxHighlighter>
                                        </div>
                                    ) : (
                                        <code className="font-mono text-sm bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded" {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                                // Handle HTML Details for Solutions
                                // @ts-expect-error - HTML types overlap
                                details: SolutionToggle
                            }}
                        >
                            {content.raw}
                        </ReactMarkdown>
                    </article>
                </div>

                <div className="mt-8 text-center text-gray-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} Problem Viewer. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}

// Wrap in Suspense for useSearchParams
export default function ProblemPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}>
            <ProblemViewer />
        </Suspense>
    );
}
