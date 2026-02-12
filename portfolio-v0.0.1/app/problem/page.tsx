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
import {
    ChevronDown,
    ChevronUp,
    Loader2,
    AlertCircle,
    Code2
} from 'lucide-react';

// --- Types ---
interface ProblemContent {
    raw: string;
    // Tags are parsed from the content or metadata
    tags?: string[];
}

// --- Helper Functions ---
const extractText = (nodes: any): string => {
    if (!nodes) return '';
    if (typeof nodes === 'string') return nodes;
    if (Array.isArray(nodes)) return nodes.map(extractText).join('');
    if (nodes.props && nodes.props.children) return extractText(nodes.props.children);
    return '';
};

// --- Components ---

// Mermaid Renderer with Sanitation
const MermaidDiagram = ({ chart }: { chart: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'default',
                securityLevel: 'loose',
                fontFamily: 'inherit'
            });
        }
    }, []);

    useEffect(() => {
        if (!chart || !ref.current) return;

        const renderChart = async () => {
            try {
                const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

                // Sanitation Logic (matches ProblemsViewer)
                let fixedChart = chart;
                fixedChart = fixedChart.replace(/\[((?:[^"\]\n]*?[=*\/()%&-][^"\]\n]*?))\]/g, (match, content) => {
                    if (content.trim().startsWith('"')) return match;
                    return `["${content}"]`;
                });
                fixedChart = fixedChart.replace(/([a-zA-Z0-9_]+)\s*\{((?:[^{}"\n]*?[=*\/()%&-][^{}"\n]*?))\}/g, (match, id, content) => {
                    if (content.trim().startsWith('"')) return match;
                    return `${id}{"${content}"}`;
                });
                fixedChart = fixedChart.replace(/([a-zA-Z0-9_]+)\s*\(((?:[^")\n]*?[=*\/()%&-][^")\n]*?))\)/g, (match, id, content) => {
                    if (content.trim().startsWith('"')) return match;
                    return `${id}("${content}")`;
                });

                const { svg } = await mermaid.render(id, fixedChart);
                if (ref.current) {
                    ref.current.innerHTML = svg;
                    setError(false);
                }
            } catch (err) {
                console.error("Mermaid parsing failed", err);
                setError(true);
                if (ref.current) ref.current.innerHTML = '';
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



    return (
        <div
            ref={ref}
            className="flex justify-center p-6 bg-white rounded-lg border border-gray-100 my-6 overflow-x-auto not-prose"
        />
    );
};

// Details/Summary Renderer
const DetailsRenderer = ({ children, ...props }: any) => (
    <details
        className="group my-6 border border-blue-100 rounded-lg overflow-hidden bg-white open:bg-blue-50/10 not-prose"
        {...props}
    >
        {children}
    </details>
);

const SummaryRenderer = ({ children, ...props }: any) => (
    <summary
        className="flex items-center justify-between px-5 py-3 text-left font-medium cursor-pointer list-none hover:bg-gray-50 text-gray-700 select-none group-open:text-blue-700 group-open:bg-blue-50"
        {...props}
    >
        <span className="flex items-center gap-2 text-lg font-semibold">
            <Code2 size={20} className="text-blue-500" />
            {children}
        </span>
        <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
    </summary>
);

// Main Content Viewer
function ProblemViewer() {
    const searchParams = useSearchParams();
    const setId = searchParams.get('set');

    const [content, setContent] = useState<ProblemContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


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
                // Determine if fetch URL should be local or from GitHub 
                // Creating a generic fetcher that works with the existing logic
                const res = await fetch(`/content/${setId}.md`);


                if (!res.ok) {

                    throw new Error("Failed to load problem content.");
                }

                const text = await res.text();
                // Simple tag extraction if present in the raw markdown text as "Tags: ..."
                // Note: The rendering logic below also handles inline "Tags:" paragraphs.
                // We'll just pass the raw text and let the renderer handle extraction for display.
                setContent({ raw: text });

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
                <div className="bg-white p-8 rounded-xl border border-red-100 max-w-md w-full text-center">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-red-500" size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading</h2>
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

    const isTestCaseBlock = (text: string) => {
        const t = text.trim().toLowerCase();
        if (t.startsWith('test case') || t.startsWith('testcase')) return true;
        if (t.includes('input:') && t.includes('output:')) return true;
        return false;
    };

    const renderTestCase = (children: React.ReactNode) => (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-3 font-mono text-sm text-gray-700 whitespace-pre-wrap">
            {children}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">


                {/* Content Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-10 overflow-hidden">
                    <article className="prose prose-slate max-w-none 
                        prose-headings:text-gray-900 
                        prose-h1:text-4xl prose-h1:font-extrabold prose-h1:mb-8
                        prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200
                        prose-h3:text-2xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-4
                        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-base prose-p:mb-6
                        prose-li:text-gray-700
                        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                        prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-gray-900 prose-pre:p-0 prose-pre:text-sm 
                        prose-pre:shadow-none prose-pre:rounded-lg prose-pre:my-8
                        prose-strong:font-bold prose-strong:text-gray-900
                    ">
                        <ReactMarkdown

                            remarkPlugins={[remarkGfm, remarkBreaks]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                h1: ({ children }) => <h1 className="text-4xl font-extrabold text-gray-900 mt-10 mb-6 pb-4 border-b border-gray-200">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-3xl font-bold text-gray-800 mt-10 mb-6">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4 border-l-4 border-blue-500 pl-3 bg-gray-50 py-1 rounded-r flex items-center">{children}</h3>,

                                p: ({ children }) => {
                                    const text = extractText(children).trim();

                                    // 1. Title Heuristic
                                    if (/^\d+\s+[A-Za-z]/.test(text) && text.length < 100 && !text.includes('.')) {
                                        return <h1 className="text-3xl font-extrabold text-gray-900 mt-10 mb-6 pb-4 border-b border-gray-200">{children}</h1>;
                                    }

                                    // 2. Section Headers
                                    const sectionHeaders = ['Problem Description', 'Flowchart', 'Test Cases', 'Input', 'Output', 'Constraints', 'Algorithm', 'Explanation', 'Solution'];
                                    const isHeader = sectionHeaders.some(h => text.toLowerCase() === h.toLowerCase() || text.toLowerCase() === h.toLowerCase() + ':');
                                    if (isHeader) {
                                        return <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4 flex items-center gap-2 border-l-4 border-blue-500 pl-3 bg-gray-50 py-1 rounded-r">{children}</h3>;
                                    }

                                    // 3. Tags
                                    if (text.toLowerCase().startsWith('tag:') || text.toLowerCase().startsWith('tags:')) {
                                        const tags = text.replace(/^Tags?:\s*/i, '').split(',');
                                        return (
                                            <div className="flex flex-wrap gap-2 mb-8">
                                                {tags.map(tag => {
                                                    const t = tag.trim().toLowerCase();
                                                    let colorClass = 'bg-blue-100 text-blue-700'; // Default
                                                    if (t.includes('beginner') || t.includes('easy')) colorClass = 'bg-yellow-100 text-yellow-800';
                                                    else if (t.includes('intermediate') || t.includes('medium')) colorClass = 'bg-green-100 text-green-700';
                                                    else if (t.includes('advanced') || t.includes('hard')) colorClass = 'bg-red-100 text-red-700';

                                                    return (
                                                        <span key={tag} className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${colorClass}`}>
                                                            {tag.trim()}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        );
                                    }

                                    // 4. Test Cases
                                    if (isTestCaseBlock(text)) {
                                        return renderTestCase(children);
                                    }

                                    return <p className="mb-6 leading-relaxed text-gray-700">{children}</p>;
                                },

                                li: ({ children }) => {
                                    const text = extractText(children);
                                    if (isTestCaseBlock(text)) {
                                        return <li className="list-none my-2">{renderTestCase(children)}</li>;
                                    }
                                    return <li className="text-gray-700">{children}</li>;
                                },

                                code({ node, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const contentStr = String(children).replace(/\n$/, '');

                                    // Mermaid Detection
                                    const isMermaid =
                                        (match && match[1] === 'mermaid') ||
                                        ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram', 'pie', 'gantt', 'journey', 'gitGraph'].some(k => contentStr.trim().startsWith(k));

                                    if (isMermaid) {
                                        return <MermaidDiagram chart={contentStr} />;
                                    }

                                    return match ? (
                                        <div className="relative group rounded-lg overflow-hidden my-6 border border-gray-200 not-prose">
                                            <SyntaxHighlighter

                                                style={vscDarkPlus}
                                                language={match[1]}
                                                PreTag="div"
                                                customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.9rem', lineHeight: '1.6' }}

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
                                details: DetailsRenderer,
                                summary: SummaryRenderer
                            }}
                        >
                            {content.raw}
                        </ReactMarkdown>
                    </article>
                </div>


            </div>
        </div>
    );
}


export default function ProblemPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}>
            <ProblemViewer />
        </Suspense>
    );
}
