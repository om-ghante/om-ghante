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
    File,
    GitCommit,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';

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
            className="my-6 flex justify-center bg-white w-full p-4 overflow-x-auto not-prose"
        />
    );
};

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

interface CommitLog {
    sha: string;
    message: string;
    date: string;
    author: string;
    url: string;
}

interface RepoViewerProps {
    owner?: string;
    repo?: string;
    branch?: string;
    title?: string;
}

export default function RepoViewer({
    owner = 'om-ghante',
    repo = 'easy-problems',
    branch = 'main',
    title = 'Problems'
}: RepoViewerProps) {
    const [sections, setSections] = useState<Section[]>([]);
    const [rootReadme, setRootReadme] = useState<{ name: string, lastModified?: string } | null>(null);
    const [selected, setSelected] = useState<Selection | null>(null);
    const [content, setContent] = useState<string>('');
    const [viewedFiles, setViewedFiles] = useState<Set<string>>(new Set());
    const [showLogs, setShowLogs] = useState(false);

    const [loadingList, setLoadingList] = useState<boolean>(true);
    const [loadingContent, setLoadingContent] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    const toggleFolder = (folder: string) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(folder)) {
                newSet.delete(folder);
            } else {
                newSet.add(folder);
            }
            return newSet;
        });
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        if (window.innerWidth < 768) setIsSidebarOpen(false);
    }, []);

    const [commits, setCommits] = useState<CommitLog[]>([]);

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

    const fetchAllData = async () => {
        try {
            setLoadingList(true);

            const treeResponse = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
            );

            if (!treeResponse.ok) {
                if (treeResponse.status === 403) throw new Error('GitHub API Rate Limit Exceeded. Please wait a moment.');
                throw new Error('Failed to fetch repository structure.');
            }

            const treeData = await treeResponse.json();
            const allFiles = treeData.tree;

            const commitsResponse = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/commits?per_page=50`
            );

            let fetchedCommits: CommitLog[] = [];
            if (commitsResponse.ok) {
                const commitsData = await commitsResponse.json();
                if (Array.isArray(commitsData)) {
                    fetchedCommits = commitsData.map((c: any) => ({
                        sha: c.sha.substring(0, 7),
                        message: c.commit.message,
                        date: c.commit.committer.date,
                        author: c.commit.author.name,
                        url: c.html_url
                    }));
                    setCommits(fetchedCommits);
                }
            }

            const newSections: Section[] = [];
            const folderMap = new Map<string, { name: string, lastModified?: string }[]>();
            let foundReadme = null;

            allFiles.forEach((item: any) => {
                if (item.type !== 'blob' && item.type !== 'file') return;
                if (!item.path.endsWith('.md')) return;

                if (item.path.toLowerCase() === 'readme.md') {
                    foundReadme = item.path;
                    return;
                }

                const parts = item.path.split('/');
                if (parts.length === 2) {
                    const folderName = parts[0];
                    const fileName = parts[1];

                    if (!folderMap.has(folderName)) {
                        folderMap.set(folderName, []);
                    }
                    folderMap.get(folderName)?.push({ name: fileName });
                }
            });

            folderMap.forEach((files, folder) => {
                if (files.length > 0) {
                    newSections.push({
                        folder: folder,
                        files: files.sort((a, b) => a.name.localeCompare(b.name))
                    });
                }
            });

            newSections.sort((a, b) => a.folder.localeCompare(b.folder));
            setSections(newSections);

            if (foundReadme) {
                setRootReadme({ name: 'README.md' });
            }

            if (!selected) {
                if (foundReadme) {
                    setSelected({ folder: null, file: 'README.md' });
                    setViewedFiles(prev => new Set(prev).add('README.md'));
                } else if (newSections.length > 0 && newSections[0].files.length > 0) {
                    const firstFile = newSections[0].files[0];
                    const uniqueKey = `${newSections[0].folder}/${firstFile.name}`;
                    setSelected({ folder: newSections[0].folder, file: firstFile.name });
                    setViewedFiles(prev => new Set(prev).add(uniqueKey));
                }
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchContent = async () => {
        if (!selected || showLogs) return;
        try {
            setLoadingContent(true);
            setError(null);

            const path = selected.folder
                ? `${selected.folder}/${selected.file}`
                : selected.file;

            const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}?t=${Date.now()}`;

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

    useEffect(() => {
        if (!showLogs) {
            fetchContent();
        }
    }, [selected, showLogs]);

    const handleSelect = (folder: string | null, file: string) => {
        setSelected({ folder, file });
        setShowLogs(false);

        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }

        const uniqueKey = folder ? `${folder}/${file}` : file;
        setViewedFiles(prev => new Set(prev).add(uniqueKey));
    };

    const handleViewLogs = () => {
        setShowLogs(true);
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    const isSelected = (folder: string | null, file: string) => {
        return !showLogs && selected?.folder === folder && selected?.file === file;
    };

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
        <div className="flex h-screen w-full bg-white text-black overflow-hidden font-sans">
            {!isSidebarOpen && (
                <button
                    className="md:hidden absolute top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 transition-colors"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <PanelLeftOpen size={20} className="text-gray-600" />
                </button>
            )}

            <aside
                className={`
          fixed md:relative z-40 h-full bg-white border-r border-gray-200 flex-shrink-0 flex flex-col
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0 w-[320px]' : '-translate-x-full w-[320px] md:translate-x-0 md:w-[70px]'}
        `}
            >
                <div className={`p-4 border-b border-gray-100 flex-shrink-0 flex items-center bg-gray-50/50 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
                    {isSidebarOpen && (
                        <h2 className="text-lg font-bold tracking-tight text-gray-900 flex items-center gap-2">
                            <Folder size={18} className="text-blue-600" />
                            {title}
                        </h2>
                    )}
                    <button
                        onClick={() => {
                            if (isSidebarOpen) setExpandedFolders(new Set());
                            setIsSidebarOpen(!isSidebarOpen);
                        }}
                        className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors"
                        title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                    >
                        {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                    </button>
                </div>

                <div className={`overflow-y-auto flex-1 ${isSidebarOpen ? 'px-4' : 'px-2'} pt-6 min-h-0 scrollbar-thin scrollbar-thumb-gray-200 flex flex-col`}>
                    {loadingList ? (
                        <div className="flex justify-center items-center py-10 flex-1">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 text-red-600 text-sm rounded flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5" />
                            <p>{error}</p>
                        </div>
                    ) : (
                        <nav className="space-y-6 flex-1">
                            {rootReadme && (
                                <div>
                                    <button
                                        onClick={() => handleSelect(null, rootReadme.name)}
                                        title="README"
                                        className={`
                        w-full text-left py-2 text-sm font-medium rounded-md transition-colors duration-150
                        flex items-center gap-2 relative
                        ${isSidebarOpen ? 'px-3' : 'justify-center px-0'}
                        ${isSelected(null, rootReadme.name)
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                        `}
                                    >
                                        <BookOpen size={16} className={`${isSelected(null, rootReadme.name) ? "text-white" : "text-black"} flex-shrink-0`} />
                                        {isSidebarOpen && (
                                            <>
                                                <span>README</span>
                                                {isRecentlyModified(rootReadme.name, rootReadme.lastModified) && (
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 animate-pulse ring-2 ring-white"></span>
                                                )}
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {sections.map((section) => {
                                const isExpanded = expandedFolders.has(section.folder);
                                return (
                                    <div key={section.folder}>
                                        <button
                                            onClick={() => toggleFolder(section.folder)}
                                            title={formatFolderName(section.folder)}
                                            className={`w-full flex items-center mb-0.5 mt-1 text-gray-700 hover:text-black transition-colors group ${isSidebarOpen ? 'justify-between px-3 py-1.5' : 'justify-center py-2'}`}
                                        >
                                            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                                                <Folder size={14} className="text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                                                {isSidebarOpen && formatFolderName(section.folder)}
                                            </div>
                                            {isSidebarOpen && (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                                        </button>

                                        {isExpanded && (
                                            <ul className="space-y-0 animate-in slide-in-from-top-1 duration-200">
                                                {section.files.map((file) => {
                                                    const uniqueKey = `${section.folder}/${file.name}`;
                                                    return (
                                                        <li key={file.name}>
                                                            <button
                                                                onClick={() => handleSelect(section.folder, file.name)}
                                                                title={formatFileName(file.name)}
                                                                className={`
                                        w-full text-left py-1.5 text-sm rounded-md transition-colors duration-200
                                        flex items-center gap-2 relative
                                        ${isSidebarOpen ? 'px-3 pl-7 border-l-2' : 'justify-center px-0'}
                                        ${isSelected(section.folder, file.name)
                                                                        ? 'bg-blue-600 text-white font-medium border-blue-700'
                                                                        : 'border-transparent text-black hover:bg-gray-100'}
                                    `}
                                                            >
                                                                <File size={16} className="flex-shrink-0" />

                                                                {isSidebarOpen && <span className="truncate">{formatFileName(file.name)}</span>}

                                                                {isRecentlyModified(uniqueKey, file.lastModified) && (
                                                                    <span className={`ml-auto w-1.5 h-1.5 rounded-full shrink-0 ${isSelected(section.folder, file.name) ? 'bg-white' : 'bg-blue-600'} ${!isSidebarOpen && 'absolute top-0 right-1'}`} title="Updated recently"></span>
                                                                )}
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    )}
                </div>

                <div className={`p-4 ${!isSidebarOpen && 'flex justify-center'}`}>
                    <button
                        onClick={handleViewLogs}
                        title="View Recent Commits"
                        className={`flex items-center gap-3 w-full rounded-lg text-sm font-medium transition-colors ${isSidebarOpen ? 'px-4 py-3' : 'p-2 justify-center'} ${showLogs ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <GitCommit size={18} />
                        {isSidebarOpen && "View Recent Commits"}
                    </button>
                </div>
            </aside>

            <main className="flex-1 h-full overflow-y-auto bg-white scroll-smooth cursor-default">
                <div className="max-w-4xl mx-auto px-6 py-10 md:px-12 md:py-16">

                    {showLogs ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
                                <GitCommit size={32} className="text-blue-600" />
                                Commit History
                            </h1>
                            <div className="space-y-2">
                                {commits.length === 0 ? (
                                    <p className="text-gray-500">No commits found.</p>
                                ) : (
                                    commits.map((commit) => (
                                        <div key={commit.sha} className="py-2 px-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <a href={commit.url} target="_blank" rel="noopener noreferrer" className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0 hover:underline">{commit.sha}</a>
                                                <span className="text-sm text-gray-800 truncate" title={commit.message}>{commit.message}</span>
                                            </div>
                                            <div className="flex items-center gap-4 shrink-0">
                                                <span className="text-xs text-gray-500">by <span className="font-medium text-gray-700">{commit.author}</span></span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        loadingContent ? (
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
                    prose-pre:bg-transparent prose-pre:p-0 prose-pre:text-sm 
                    prose-pre:shadow-none prose-pre:rounded-lg prose-pre:my-8
                    prose-strong:font-bold prose-strong:text-gray-900
                ">
                                {(selected?.folder || selected?.file) && (
                                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-6 uppercase tracking-widest">
                                        <span className="w-2.5 h-2.5 rounded-full bg-sky-600 shrink-0"></span>
                                        {selected.folder && (
                                            <>
                                                <span>{formatFolderName(selected.folder)}</span>
                                                <ChevronRight size={12} />
                                            </>
                                        )}
                                        <span className="text-gray-900">{formatFileName(selected.file)}</span>
                                    </div>
                                )}

                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkBreaks]}
                                    rehypePlugins={[rehypeRaw]}
                                    components={{
                                        h1: ({ children }) => <h1 className="text-4xl font-extrabold text-gray-900 mt-10 mb-6 pb-4 border-b border-gray-200">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-3xl font-bold text-gray-800 mt-10 mb-6">{children}</h2>,
                                        h3: ({ children }) => <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4 border-l-4 border-blue-500 pl-3 bg-gray-50 py-1 rounded-r flex items-center">{children}</h3>,

                                        p: ({ children }) => {
                                            const text = extractText(children).trim();

                                            if (/^\d+\s+[A-Za-z]/.test(text) && text.length < 100 && !text.includes('.')) {
                                                return <h1 className="text-3xl font-extrabold text-gray-900 mt-10 mb-6 pb-4 border-b border-gray-200">{children}</h1>;
                                            }

                                            const sectionHeaders = ['Problem Description', 'Flowchart', 'Test Cases', 'Input', 'Output', 'Constraints', 'Algorithm', 'Explanation', 'Solution'];
                                            const isHeader = sectionHeaders.some(h => text.toLowerCase() === h.toLowerCase() || text.toLowerCase() === h.toLowerCase() + ':');
                                            if (isHeader) {
                                                return <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4 flex items-center gap-2 border-l-4 border-blue-500 pl-3 bg-gray-50 py-1 rounded-r">{children}</h3>;
                                            }

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
                                            const codeString = String(children).replace(/\n$/, '');

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
                        )
                    )}
                </div>
            </main>
        </div>
    );
}
