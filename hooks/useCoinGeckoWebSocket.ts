'use client';
import { useEffect, useRef, useState } from "react";

const WS_BASE = `${process.env.NEXT_PUBLIC_COINGECKO_WEBSOCKET_URL}?x_cg_demo_api_key=${process.env.NEXT_PUBLIC_COINGECKO_API_KEY}`;

export const useCoinGeckoWebSocket = ({
  coinId, 
  poolId,
  liveInterval,
}: UseCoinGeckoWebSocketProps): UseCoinGeckoWebSocketReturn => {
  const wsRef = useRef<WebSocket | null>(null);
  const subscribed = useRef<Set<string>>(new Set());

  const [price, setPrice] = useState<ExtendedPriceData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [ohlcv, setOhlcv] = useState<OHLCData | null>(null);
  const [isWsReady, setIsWsReady] = useState(false);

  //this useEffect sets up websocket make sure it is alive
  useEffect(() => {
    const ws = new WebSocket(WS_BASE);
    wsRef.current = ws;

    const send = (payload: Record<string, unknown>) => ws.send(JSON.stringify(payload));

    const handleMessage = (event: MessageEvent) => {
      let msg: WebSocketMessage;
      try {
        msg = JSON.parse(event.data);
      } catch {
        console.error('Failed to parse WebSocket message:', event.data);
        return;
      }
      if (msg.type === 'ping') {
        send({ type: 'pong' });
        return;
      }
      if(msg.type === 'confirm_subscription') {
        let channel: string;
        try {
          channel = JSON.parse(msg?.identifier ?? '{}').channel;
        } catch {
          return;
        }
        if (channel) subscribed.current.add(channel);
      }
      //price update
      if(msg.c === 'C1') {
        setPrice({
          usd: msg.p ?? 0,
          coin: msg.i,
          price: msg.p,
          change24h: msg.pp,
          marketCap: msg.m,
          volume24h: msg.v,
          timestamp: msg.t,
        })
      }
      //trade update
      if(msg.c === 'G2') {
        const newTrade: Trade = {
          price: msg.pu,
          timestamp: msg.t ?? 0,
          type: msg.ty,
          amount: msg.to,
          value: msg.vo,
        }
        setTrades((prev) => [newTrade, ...prev].slice(0, 7));
      }
      //OHLC update
      if(msg.ch === 'G3') {
        const timestamp = msg.t ?? 0;
        const candle: OHLCData = [
          timestamp,
          Number(msg.o ?? 0),
          Number(msg.h ?? 0),
          Number(msg.l ?? 0),
          Number(msg.c ?? 0),
        ]
        setOhlcv(candle);
      }
    };

    ws.onopen = () => setIsWsReady(true);
    ws.onmessage = handleMessage;
    ws.onclose = () => setIsWsReady(false);

    return () => ws.close();

  }, []);

  //this useEffect connect the websocket and subscribe to different channels
  useEffect(() => {
    if(!isWsReady) return;
    const ws = wsRef.current;
    if(!ws) return;
    //helper function to send messages
    const send = (payload: Record<string, unknown>) => ws.send(JSON.stringify(payload));

    const unsubscribeAll = () => {
      subscribed.current.forEach((channel) => {
        send({
          command: 'unsubscribe',
          identifier: JSON.stringify({channel})
        });
      });
      subscribed.current.clear();
    }

    const subscribe = (channel: string, data?: Record<string, unknown>) => {
      if(subscribed.current.has(channel)) return;
      send({
        command: 'subscribe',
        identifier: JSON.stringify({channel})
      })
      if(data) {
        send({
          command: 'message',
          identifier: JSON.stringify({channel}),
          data: JSON.stringify({data})
        })
      }
    }
    //define a microtask , resets state and resubscribes safely
    queueMicrotask(() => {
      setPrice(null);
      setTrades([]);
      setOhlcv(null);

      unsubscribeAll();
      subscribe('CGSimplePrice', { coin_id: [coinId], action: 'set_tokens'})
      const poolAddress = poolId.replace('_', ':');
      //subscribe to onchain trades
      if(poolAddress) {
        subscribe('OnchainTrade', {
          'network_id:pool_addresses': [poolAddress],
          action: 'set_pools',
        });
        subscribe('OnchainOHLCV', {
          'network_id:pool_addresses': [poolAddress],
          interval: liveInterval,
          action: 'set_pools',
        })
      }
    })
    

  }, [
    coinId, poolId, isWsReady, liveInterval
  ]);
  return {
    price,
    trades,
    ohlcv,
    isConnected: isWsReady,
  }
}