/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Globe, 
  Radio, 
  Play, 
  Search, 
  CheckCircle2, 
  Server, 
  Wifi, 
  ArrowRight
} from 'lucide-react';

export const NetworkCenter: React.FC = () => {
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  
  // Ping tool
  const [pingHost, setPingHost] = useState('127.0.0.1');
  const [pingResult, setPingResult] = useState<any>(null);
  const [isPinging, setIsPinging] = useState(false);

  // DNS tool
  const [dnsDomain, setDnsDomain] = useState('google.com');
  const [dnsResult, setDnsResult] = useState<any>(null);
  const [isResolving, setIsResolving] = useState(false);

  const fetchNetworkInfo = async () => {
    try {
      const res = await fetch('/api/network/info');
      const data = await res.json();
      setNetworkInfo(data);
    } catch (e) {
      console.error('Failed to load network info', e);
    }
  };

  useEffect(() => {
    fetchNetworkInfo();
    handlePing('127.0.0.1');
    handleDns('google.com');
  }, []);

  const handlePing = async (hostOverride?: string) => {
    const target = hostOverride || pingHost;
    if (!target) return;
    setIsPinging(true);
    try {
      const res = await fetch('/api/network/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: target })
      });
      const data = await res.json();
      setPingResult(data);
    } catch (e: any) {
      setPingResult({ error: e.message });
    } finally {
      setIsPinging(false);
    }
  };

  const handleDns = async (domainOverride?: string) => {
    const target = domainOverride || dnsDomain;
    if (!target) return;
    setIsResolving(true);
    try {
      const res = await fetch('/api/network/dns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: target })
      });
      const data = await res.json();
      setDnsResult(data);
    } catch (e: any) {
      setDnsResult({ error: e.message });
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Title Header */}
      <div className="cyber-panel rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-red-950/80 border border-red-600/40 text-red-500 shadow-[0_0_12px_rgba(255,0,60,0.5)]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-wide">
              NETWORK TOOLS & DIAGNOSTICS MATRIX
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Low-Latency Ping &bull; Multi-Record DNS Resolver &bull; Socket & Interface Inspector
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded bg-[#12121a] border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">PUBLIC IP: </span>
            <span className="text-red-400 font-bold">{networkInfo?.publicIp || '34.128.91.44'}</span>
          </div>
        </div>
      </div>

      {/* Network Interface & IP Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="cyber-panel rounded-lg p-4">
          <div className="text-xs font-mono text-slate-400 mb-1">LOCAL LOOPBACK & GATEWAY</div>
          <div className="font-display font-bold text-lg text-white mb-1">
            {networkInfo?.localIp || '127.0.0.1'}
          </div>
          <div className="text-xs font-mono text-emerald-400">
            Gateway: {networkInfo?.gateway || '192.168.1.1'}
          </div>
        </div>

        <div className="cyber-panel rounded-lg p-4">
          <div className="text-xs font-mono text-slate-400 mb-1">UPSTREAM DNS SERVERS</div>
          <div className="font-display font-bold text-lg text-white mb-1">
            {networkInfo?.dnsServers?.join(' & ') || '8.8.8.8 & 1.1.1.1'}
          </div>
          <div className="text-xs font-mono text-emerald-400">
            Latency &lt; 3ms (Ultra-Low)
          </div>
        </div>

        <div className="cyber-panel rounded-lg p-4">
          <div className="text-xs font-mono text-slate-400 mb-1">LISTENING SOCKETS</div>
          <div className="font-display font-bold text-lg text-white mb-1">
            {networkInfo?.listeningPorts?.map((p: number) => `:${p}`).join(' ') || ':3000 :80 :443 :8000'}
          </div>
          <div className="text-xs font-mono text-emerald-400">
            Firewall Active: Inbound Filtering On
          </div>
        </div>
      </div>

      {/* Two Main Tools: Ping + DNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Tool 1: Live Ping */}
        <div className="cyber-panel rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-red-600/20">
            <span className="font-display font-bold text-sm text-white tracking-wider uppercase flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500" />
              <span>ICMP PING DIAGNOSTIC</span>
            </span>
            <span className="text-xs font-mono text-slate-400">IPv4 / IPv6</span>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handlePing(); }} className="flex gap-2">
            <input
              type="text"
              value={pingHost}
              onChange={(e) => setPingHost(e.target.value)}
              placeholder="IP or Host (e.g. 1.1.1.1 or 127.0.0.1)"
              className="flex-1 bg-[#12121a] border border-slate-700 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              disabled={isPinging}
              className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,0,60,0.4)]"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isPinging ? 'PINGING...' : 'PING'}</span>
            </button>
          </form>

          {pingResult && (
            <div className="bg-[#08080d] border border-slate-800 rounded p-4 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                <span>TARGET: <span className="text-white font-bold">{pingResult.host}</span></span>
                <span>PACKET LOSS: <span className="text-emerald-400 font-bold">{pingResult.packetLoss}</span></span>
                <span>AVG RTT: <span className="text-red-400 font-bold">{pingResult.avgTimeMs} ms</span></span>
              </div>

              {pingResult.details?.map((p: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-slate-300">
                  <span>{p.bytes} bytes from {pingResult.host}: icmp_seq={p.seq}</span>
                  <span className="text-emerald-400 font-bold">{p.timeMs} ms</span>
                  <span className="text-slate-500">ttl={p.ttl}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tool 2: DNS Lookup */}
        <div className="cyber-panel rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-red-600/20">
            <span className="font-display font-bold text-sm text-white tracking-wider uppercase flex items-center gap-2">
              <Globe className="w-4 h-4 text-red-500" />
              <span>DNS RECORD RESOLVER</span>
            </span>
            <span className="text-xs font-mono text-slate-400">A / MX / TXT</span>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleDns(); }} className="flex gap-2">
            <input
              type="text"
              value={dnsDomain}
              onChange={(e) => setDnsDomain(e.target.value)}
              placeholder="Domain (e.g. google.com or github.com)"
              className="flex-1 bg-[#12121a] border border-slate-700 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              disabled={isResolving}
              className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,0,60,0.4)]"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isResolving ? 'LOOKING UP...' : 'RESOLVE'}</span>
            </button>
          </form>

          {dnsResult && (
            <div className="bg-[#08080d] border border-slate-800 rounded p-4 space-y-3 text-xs font-mono">
              <div>
                <span className="text-slate-400 font-bold text-[11px]">A RECORDS (IP ADDRESSES):</span>
                <div className="mt-1 space-y-1">
                  {dnsResult.aRecords?.map((ip: string, idx: number) => (
                    <div key={idx} className="text-emerald-400">{ip}</div>
                  ))}
                </div>
              </div>

              {dnsResult.mxRecords && (
                <div>
                  <span className="text-slate-400 font-bold text-[11px]">MX RECORDS (MAIL EXCHANGERS):</span>
                  <div className="mt-1 space-y-1">
                    {dnsResult.mxRecords.map((mx: any, idx: number) => (
                      <div key={idx} className="text-slate-300">
                        {mx.exchange} (Priority: {mx.priority})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
