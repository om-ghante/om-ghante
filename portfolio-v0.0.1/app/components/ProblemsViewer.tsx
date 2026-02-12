'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
import {
    Loader2,
    AlertCircle,
    Menu,
    X,
    BookOpen,
    Code2,
    ChevronDown,
    Folder,
    File
} from 'lucide-react';

// --- Mermaid Renderer Component ---
const MermaidRenderer = ({ chart }: { chart: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            mermaid.initialize({
                startOnLoad: false,
                securityLevel: 'loose',
                theme: 'default'
            });
        }
    }, []);

    useEffect(() => {
        if (!chart || !ref.current) return;

        const render = async () => {
            try {
                const id = 'mermaid-' + Math.random().toString(36).slice(2);

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
            } catch (e) {
                console.error("Mermaid error:", e);
                setError(true);
                if (ref.current) {
                    ref.current.innerHTML = '';
                }
            }
        };

        render();
    }, [chart]);

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 text-sm border border-red-200 rounded font-mono my-4 whitespace-pre-wrap">
                <div className="font-bold mb-2 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Diagram Syntax Error
                </div>
                <div>Please check the Mermaid syntax in your markdown file.</div>
                <div className="mt-2 text-xs text-gray-500 overflow-x-auto p-2 bg-gray-50 rounded border border-gray-100">
                    {chart}
                </div>
            </div>
        );
    }

    return (
        <div
            ref={ref}
            className="my-6 flex justify-center bg-white border border-gray-200 rounded-lg p-6 overflow-x-auto not-prose"
        />
    );
};

// --- Helper Components ---

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

// --- Interfaces ---

interface GithubItem {
    name: string;
    path: string;
    type: 'file' | 'dir';
    download_url: string;
}

interface Section {
    folder: string;
    files: {
        name: string;
        lastModified?: string;
    }[];
}

interface Selection {
    folder: string | null;
    file: string;
}

const GITHUB_OWNER = 'om-ghante';
const GITHUB_REPO = 'easy-problems';
const GITHUB_BRANCH = 'main';

export default function ProblemsViewer() {
    const [sections, setSections] = useState<Section[]>([]);
    const [rootReadme, setRootReadme] = useState<{ name: string, lastModified?: string } | null>(null);
    const [selected, setSelected] = useState<Selection | null>(null);
    const [content, setContent] = useState<string>('');
    const [viewedFiles, setViewedFiles] = useState<Set<string>>(new Set());

    const [loadingList, setLoadingList] = useState<boolean>(true);
    const [loadingContent, setLoadingContent] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Helper to extract plain text
    const extractText = (nodes: any): string => {
        if (!nodes) return '';
        if (typeof nodes === 'string') return nodes;
        if (Array.isArray(nodes)) return nodes.map(extractText).join('');
        if (nodes.props && nodes.props.children) return extractText(nodes.props.children);
        return '';
    };

    const formatFolderName = (name: string) => {
        return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
    };

    const formatFileName = (name: string) => {
        return name.replace(/\.md$/, '').replace(/-/g, ' ');
    };

    const isRecentlyModified = (filename: string, isoDateString?: string) => {
        if (!isoDateString) return false;
        if (viewedFiles.has(filename)) return false;
        const modifiedTime = new Date(isoDateString).getTime();
        const currentTime = new Date().getTime();
        const twelveHoursMs = 12 * 60 * 60 * 1000;
        return (currentTime - modifiedTime) < twelveHoursMs;
    };

    useEffect(() => {
        const fetchStructure = async () => {
            try {
                setLoadingList(true);

                // 1. Fetch root contents
                const rootResponse = await fetch(
                    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`
                );

                if (!rootResponse.ok) throw new Error('Failed to fetch repository contents');
                const rootData: GithubItem[] = await rootResponse.json();

                // 2. Fetch Recent Commits (Last 12 hours)
                const commitsResponse = await fetch(
                    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits?per_page=50`
                );

                const fileModificationMap = new Map<string, string>();

                if (commitsResponse.ok) {
                    const commitsData = await commitsResponse.json();
                    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
                    const recentCommits = commitsData.filter((c: any) => new Date(c.commit.committer.date) > twelveHoursAgo);

                    await Promise.all(recentCommits.map(async (commit: any) => {
                        const detailRes = await fetch(commit.url);
                        if (detailRes.ok) {
                            const detail = await detailRes.json();
                            detail.files.forEach((f: any) => {
                                if (!fileModificationMap.has(f.filename)) {
                                    fileModificationMap.set(f.filename, commit.commit.committer.date);
                                }
                            });
                        }
                    }));
                }

                // 3. Process README
                const readmeItem = rootData.find(
                    item => item.type === 'file' && item.name.toLowerCase() === 'readme.md'
                );
                const readmeName = readmeItem ? readmeItem.name : null;
                setRootReadme(readmeName ? {
                    name: readmeName,
                    lastModified: fileModificationMap.get(readmeName)
                } : null);

                // 4. Process Directories
                const directories = rootData.filter(item => item.type === 'dir');

                const sectionsPromises = directories.map(async (dir) => {
                    const dirResponse = await fetch(dir.download_url || `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${dir.path}`);
                    if (!dirResponse.ok) return null;

                    const dirItems: GithubItem[] = await dirResponse.json();
                    const mdFiles = dirItems
                        .filter(item => item.type === 'file' && item.name.endsWith('.md'))
                        .map(item => ({
                            name: item.name,
                            lastModified: fileModificationMap.get(`${dir.path}/${item.name}`) // key is full path
                        }));

                    if (mdFiles.length === 0) return null;

                    return {
                        folder: dir.name,
                        files: mdFiles
                    };
                });

                const fetchedSections = (await Promise.all(sectionsPromises)).filter(Boolean) as Section[];
                setSections(fetchedSections);

                // Set default selection
                if (readmeName && !selected) {
                    setSelected({ folder: null, file: readmeName });
                    setViewedFiles(prev => new Set(prev).add(readmeName));
                } else if (fetchedSections.length > 0 && fetchedSections[0].files.length > 0 && !selected) {
                    const firstFile = fetchedSections[0].files[0];
                    const uniqueKey = `${fetchedSections[0].folder}/${firstFile.name}`;
                    setSelected({ folder: fetchedSections[0].folder, file: firstFile.name });
                    setViewedFiles(prev => new Set(prev).add(uniqueKey));
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
            } finally {
                setLoadingList(false);
            }
        };

        fetchStructure();
    }, []);

    useEffect(() => {
        if (!selected) return;

        const fetchContent = async () => {
            try {
                setLoadingContent(true);
                setError(null);

                const path = selected.folder
                    ? `${selected.folder}/${selected.file}`
                    : selected.file;

                const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}?t=${Date.now()}`;

                const response = await fetch(url);

                if (!response.ok) throw new Error('Failed to fetch file content');

                const text = await response.text();
                setContent(text);
            } catch (err) {
                setContent(`# Error\n\nFailed to load content.`);
            } finally {
                setLoadingContent(false);
            }
        };

        fetchContent();
    }, [selected]);

    const handleSelect = (folder: string | null, file: string) => {
        setSelected({ folder, file });
        setIsSidebarOpen(false);

        const uniqueKey = folder ? `${folder}/${file}` : file;
        setViewedFiles(prev => new Set(prev).add(uniqueKey));
    };

    const isSelected = (folder: string | null, file: string) => {
        return selected?.folder === folder && selected?.file === file;
    };

    // Helper to detect if a block of text is a test case
    const isTestCaseBlock = (text: string) => {
        const t = text.trim().toLowerCase();
        // Heuristic 1: Starts with "Test Case" or "Testcase"
        if (t.startsWith('test case') || t.startsWith('testcase')) return true;
        // Heuristic 2: Contains "Input:" AND "Output:" (Standard format)
        if (t.includes('input:') && t.includes('output:')) return true;
        return false;
    };

    // Shared renderer for Test Cases (used in p and li)
    const renderTestCase = (children: React.ReactNode) => (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-3 font-mono text-sm text-gray-700 whitespace-pre-wrap">
            {children}
        </div>
    );

    return (
        <div className="flex h-screen w-full bg-white text-black overflow-hidden font-sans">
            {/* Mobile Menu Button */}
            <button
                className="md:hidden absolute top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`
          fixed md:relative z-40 h-full w-[280px] bg-white border-r border-gray-200 flex-shrink-0 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
            >
                <div className="p-6 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <Folder size={20} className="text-blue-600" />
                        Practice Problems
                    </h2>
                </div>

                <div className="overflow-y-auto flex-1 p-4 scrollbar-thin scrollbar-thumb-gray-200">
                    {loadingList ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 text-red-600 text-sm rounded flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5" />
                            <p>{error}</p>
                        </div>
                    ) : (
                        <nav className="space-y-6">
                            {/* Root README */}
                            {rootReadme && (
                                <div>
                                    <button
                                        onClick={() => handleSelect(null, rootReadme.name)}
                                        className={`
                      w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150
                      flex items-center gap-2 relative
                      ${isSelected(null, rootReadme.name)
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                    `}
                                    >
                                        <BookOpen size={16} className={isSelected(null, rootReadme.name) ? "text-white" : "text-black"} />
                                        README
                                        {isRecentlyModified(rootReadme.name, rootReadme.lastModified) && (
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 animate-pulse ring-2 ring-white"></span>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Folder Sections */}
                            {sections.map((section) => (
                                <div key={section.folder}>
                                    <div className="flex items-center gap-2 px-3 mb-2 text-gray-900 font-semibold text-xs uppercase tracking-wider">
                                        <Folder size={14} className="text-black" />
                                        {formatFolderName(section.folder)}
                                    </div>
                                    <ul className="space-y-0.5">
                                        {section.files.map((file) => {
                                            const uniqueKey = `${section.folder}/${file.name}`;
                                            return (
                                                <li key={file.name}>
                                                    <button
                                                        onClick={() => handleSelect(section.folder, file.name)}
                                                        className={`
                            w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-150 pl-6
                            flex items-center gap-2 relative
                            ${isSelected(section.folder, file.name)
                                                                ? 'bg-blue-50 text-blue-700 font-medium'
                                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                          `}
                                                    >
                                                        <File size={14} className={isSelected(section.folder, file.name) ? "text-blue-600" : "text-black"} />
                                                        <span className="truncate">{formatFileName(file.name)}</span>

                                                        {isRecentlyModified(uniqueKey, file.lastModified) && (
                                                            <span className="ml-auto w-2 h-2 rounded-full bg-blue-500 shrink-0" title="Updated recently"></span>
                                                        )}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}

                            {sections.length === 0 && !rootReadme && (
                                <div className="text-sm text-gray-400 px-3">No documentation found.</div>
                            )}
                        </nav>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto bg-white scroll-smooth cursor-default">
                <div className="max-w-4xl mx-auto px-6 py-10 md:px-12 md:py-16">
                    {loadingContent ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <p className="text-gray-500 text-sm">Loading documentation...</p>
                        </div>
                    ) : (
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

                                        // 2. Section Header Heuristic
                                        const sectionHeaders = ['Problem Description', 'Flowchart', 'Test Cases', 'Input', 'Output', 'Constraints', 'Algorithm', 'Explanation', 'Solution'];
                                        const isHeader = sectionHeaders.some(h => text.toLowerCase() === h.toLowerCase() || text.toLowerCase() === h.toLowerCase() + ':');
                                        if (isHeader) {
                                            return <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4 flex items-center gap-2 border-l-4 border-blue-500 pl-3 bg-gray-50 py-1 rounded-r">{children}</h3>;
                                        }

                                        // 3. Tags Heuristic
                                        if (text.toLowerCase().startsWith('tag:') || text.toLowerCase().startsWith('tags:')) {
                                            const tags = text.replace(/^Tags?:\s*/i, '').split(',');
                                            return (
                                                <div className="flex flex-wrap gap-2 mb-8">
                                                    {tags.map(tag => {
                                                        const t = tag.trim().toLowerCase();
                                                        let colorClass = 'bg-blue-100 text-blue-700';

                                                        if (t.includes('beginner') || t.includes('easy')) {
                                                            colorClass = 'bg-yellow-100 text-yellow-800';
                                                        } else if (t.includes('intermediate') || t.includes('medium')) {
                                                            colorClass = 'bg-green-100 text-green-700';
                                                        } else if (t.includes('advanced') || t.includes('hard')) {
                                                            colorClass = 'bg-red-100 text-red-700';
                                                        }

                                                        return (
                                                            <span key={tag} className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${colorClass}`}>
                                                                {tag.trim()}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        }

                                        // 4. Test Case Heuristic
                                        if (isTestCaseBlock(text)) {
                                            return renderTestCase(children);
                                        }

                                        return <p className="mb-6 leading-relaxed text-gray-700">{children}</p>;
                                    },

                                    // Added LI support for Test Cases
                                    li: ({ children }) => {
                                        const text = extractText(children);
                                        if (isTestCaseBlock(text)) {
                                            return <li className="list-none my-2">{renderTestCase(children)}</li>;
                                        }
                                        return <li className="text-gray-700">{children}</li>;
                                    },

                                    code({ node, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const codeString = String(children).replace(/\n$/, '');

                                        // Enhanced Mermaid Detection
                                        const isMermaid =
                                            (match && match[1] === 'mermaid') ||
                                            ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram', 'pie', 'gantt', 'journey', 'gitGraph'].some(k => codeString.trim().startsWith(k));

                                        if (isMermaid) {
                                            return <MermaidRenderer chart={codeString} />;
                                        }

                                        return match ? (
                                            <div className="relative rounded-lg overflow-hidden my-6 border border-gray-200 not-prose">
                                                <SyntaxHighlighter
                                                    style={vscDarkPlus}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}
                                                >
                                                    {codeString}
                                                </SyntaxHighlighter>
                                            </div>
                                        ) : (
                                            <code className="font-mono text-sm bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded" {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    details: DetailsRenderer,
                                    summary: SummaryRenderer,
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        </article>
                    )}
                </div>
            </main>
        </div>
    );
}
