import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Database, 
  ShieldAlert, 
  User, 
  Smartphone, 
  Globe, 
  ArrowRight, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Info 
} from 'lucide-react';
import { fetchTransactionGraph } from '../api.ts';
import { PageView } from '../types.ts';

interface RelationshipGraphViewProps {
  selectedTxnId: string | null;
  onSelectTxn: (id: string) => void;
  onNavigate: (view: PageView) => void;
}

export const RelationshipGraphView: React.FC<RelationshipGraphViewProps> = ({
  selectedTxnId,
  onSelectTxn,
  onNavigate,
}) => {
  const txnId = selectedTxnId || 'TXN-9004-IN';
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const loadGraph = async (id: string) => {
    setLoading(true);
    try {
      const data = await fetchTransactionGraph(id);
      setGraphData(data);
      if (data.nodes.length > 0) {
        setSelectedNode(data.nodes[0]); // default to central transaction
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph(txnId);
  }, [txnId]);

  if (loading || !graphData) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin"></div>
        <p className="text-sm font-mono text-cyan-400">Computing Multi-Hop Graph Traversal in Exasol...</p>
      </div>
    );
  }

  // Node color helper
  const getNodeColor = (type: string, risk?: number) => {
    switch (type) {
      case 'TRANSACTION':
        return (risk && risk >= 75) ? '#f43f5e' : '#06b6d4';
      case 'ACCOUNT':
        return '#8b5cf6';
      case 'BENEFICIARY':
        return '#f59e0b';
      case 'IP':
        return '#10b981';
      case 'DEVICE':
        return '#ec4899';
      default:
        return '#64748b';
    }
  };

  // Node Icon Helper
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'TRANSACTION':
        return <Share2 className="w-3.5 h-3.5" />;
      case 'ACCOUNT':
        return <User className="w-3.5 h-3.5" />;
      case 'BENEFICIARY':
        return <Globe className="w-3.5 h-3.5" />;
      case 'DEVICE':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'IP':
        return <Globe className="w-3.5 h-3.5" />;
      default:
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <span>Entity Relationship &amp; Money Flow Graph</span>
          </h2>
          <p className="text-xs text-slate-400">
            Multi-hop relational topological analysis connecting accounts, novel counterparties, IP routes, and bound devices
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            <span>Graph Extraction: </span>
            <span className="text-cyan-400 font-bold">{graphData.execution_time_ms} ms</span>
          </div>
          {graphData.summary.risk_cluster_detected && (
            <div className="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Mule Cluster Anomaly Detected</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas & Detail Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Interactive SVG Canvas (3 Cols) */}
        <div className="lg:col-span-3 relative h-[560px] rounded-2xl bg-[#080d19] border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
          {/* Zoom & Canvas Controls */}
          <div className="absolute top-4 left-4 z-10 flex space-x-2 bg-slate-900/90 border border-slate-700 p-1.5 rounded-xl backdrop-blur-md">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.8))}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.6))}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-10 hidden md:flex space-x-4 bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl backdrop-blur-md text-[11px]">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span>Transaction</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400"></span>
              <span>Customer Account</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>Beneficiary</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>IP Address</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-400"></span>
              <span>Device Fingerprint</span>
            </div>
          </div>

          {/* Interactive SVG Network */}
          <svg
            className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})` }}
            viewBox="0 0 800 500"
          >
            {/* Defs for glow and arrow markers */}
            <defs>
              <marker
                id="arrow"
                viewBox="0 -5 10 10"
                refX="22"
                refY="0"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M0,-5L10,0L0,5" fill="#475569" />
              </marker>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Links / Edges */}
            {graphData.links.map((link: any, idx: number) => {
              // Synthetic layout coordinates for nodes
              const nodePositions: Record<string, { x: number; y: number }> = {
                [txnId]: { x: 400, y: 250 },
              };
              // Distribute other nodes around in an elliptical orbit
              const otherNodes = graphData.nodes.filter((n: any) => n.id !== txnId);
              otherNodes.forEach((n: any, i: number) => {
                const angle = (i / otherNodes.length) * 2 * Math.PI;
                const rx = 240;
                const ry = 160;
                nodePositions[n.id] = {
                  x: 400 + Math.cos(angle) * rx,
                  y: 250 + Math.sin(angle) * ry,
                };
              });

              const p1 = nodePositions[link.source] || { x: 300, y: 200 };
              const p2 = nodePositions[link.target] || { x: 500, y: 300 };

              return (
                <g key={idx}>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={link.isHighlighted ? '#06b6d4' : '#334155'}
                    strokeWidth={link.isHighlighted ? 2.5 : 1.2}
                    strokeDasharray={link.isHighlighted ? 'none' : '4 4'}
                    markerEnd="url(#arrow)"
                  />
                  {link.amount && (
                    <text
                      x={(p1.x + p2.x) / 2}
                      y={(p1.y + p2.y) / 2 - 6}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      ₹{(link.amount / 1000).toFixed(0)}k
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {graphData.nodes.map((node: any, idx: number) => {
              const otherNodes = graphData.nodes.filter((n: any) => n.id !== txnId);
              let x = 400;
              let y = 250;
              if (node.id !== txnId) {
                const i = otherNodes.findIndex((n: any) => n.id === node.id);
                const angle = (i / otherNodes.length) * 2 * Math.PI;
                x = 400 + Math.cos(angle) * 240;
                y = 250 + Math.sin(angle) * 160;
              }

              const isSelected = selectedNode?.id === node.id;
              const color = getNodeColor(node.type, node.riskScore);

              return (
                <g
                  key={node.id}
                  transform={`translate(${x}, ${y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  <circle
                    r={isSelected ? node.val + 4 : node.val}
                    fill={color}
                    fillOpacity={0.25}
                    stroke={color}
                    strokeWidth={isSelected ? 3 : 1.5}
                    filter={isSelected ? 'url(#glow)' : undefined}
                    className="transition-all duration-200"
                  />
                  <circle
                    r={node.val * 0.4}
                    fill={color}
                  />
                  <text
                    y={node.val + 14}
                    fill="#f1f5f9"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="font-semibold pointer-events-none"
                  >
                    {node.id.length > 16 ? node.id.substring(0, 14) + '...' : node.id}
                  </text>
                  <text
                    y={node.val + 25}
                    fill="#94a3b8"
                    fontSize="8"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {node.type}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Entity Detail Sidebar (1 Col) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Info className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Entity Inspection</h3>
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 uppercase">{selectedNode.type}</span>
                <div className="font-mono font-bold text-white text-sm break-all">{selectedNode.id}</div>
                {selectedNode.country && (
                  <div className="text-slate-400 text-[11px]">Jurisdiction: <strong>{selectedNode.country}</strong></div>
                )}
              </div>

              {selectedNode.riskScore !== undefined && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300">Risk Score:</span>
                  <span className="font-mono font-bold text-rose-400 text-sm">
                    {selectedNode.riskScore} / 100
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {selectedNode.type === 'TRANSACTION'
                    ? 'Primary money flow node in this cluster. Analyzed for structuring and rapid pass-through velocity.'
                    : selectedNode.type === 'BENEFICIARY'
                    ? 'Counterparty recipient node. Flags indicate novel offshore destination or shared mule ring funnel.'
                    : selectedNode.type === 'ACCOUNT'
                    ? 'Originating customer profile. Historical baselines and KYC records retrieved from Exasol.'
                    : 'Network metadata node assisting in forensic identity binding.'}
                </p>
              </div>

              {selectedNode.type === 'TRANSACTION' && (
                <button
                  onClick={() => {
                    onSelectTxn(selectedNode.id);
                    onNavigate('investigation');
                  }}
                  className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                >
                  <span>Open 360° Investigation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              Click on any node in the graph to inspect entity attributes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
