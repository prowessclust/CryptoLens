'use client';

import { getCandlestickConfig, getChartConfig, LIVE_INTERVAL_BUTTONS, PERIOD_BUTTONS, PERIOD_CONFIG } from "@/constants";
import { fetcher } from "@/lib/coingecko.actions";
import { convertOHLCData } from "@/lib/utils";
import { CandlestickSeries, createChart, IChartApi, ISeriesApi } from "lightweight-charts";
import { startTransition, useEffect, useRef, useState } from "react";

const CandlestickChart = ({ 
  children, 
  data,
  coinId,
  height = 360,
  initialPeriod = 'daily',
  liveOhlcv = null,
  mode = 'historical',
  liveInterval,
  setLiveInterval,
}: CandlestickChartProps) => {

  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const prevOhlcDataLength = useRef<number>(data?.length || 0);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState(initialPeriod);
  const [ohlcData, setOhlcData] = useState<OHLCData[]>(data ?? []);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const fetchOHLCData = async (selectedPeriod: Period) => {
    try {
      const { days } = PERIOD_CONFIG[selectedPeriod];

      const newData = await fetcher<OHLCData[]>(`/coins/${coinId}/ohlc`, {
        vs_currency: 'usd',
        days,
        precision: 'full'
      });

    
    startTransition(async () => {
      setOhlcData(newData ?? []);
    });
      
    } catch (e) {
      console.error('Failed to fetch OHLCData', e);
    }
  };

  
  const handlePeriodChange = async (newPeriod: Period) => {
    if (newPeriod === period || loading) return;

    // Rate limiting: prevent requests within 1 second
    const now = Date.now();
    const MIN_FETCH_INTERVAL = 1000; // 1 second cooldown
    
    if (now - lastFetchTime < MIN_FETCH_INTERVAL) {
      console.log('Please wait before changing period again');
      return;
    }

    setLastFetchTime(now);
    setPeriod(newPeriod);
    await fetchOHLCData(newPeriod);
  }
//Read the useEffect hook
  useEffect(() => {
    const container = chartContainerRef.current;
    if(!container) return;

    const showTime = ['daily', 'weekly', 'monthly'].includes(period);

    const chart = createChart(container, {
      ...getChartConfig(height, showTime),
      width: container.clientWidth,
    });

    const series = chart.addSeries(CandlestickSeries, getCandlestickConfig());

    // Don't set data here - let the second useEffect handle it
    chartRef.current = chart;
    candleSeriesRef.current = series;

    const observer = new ResizeObserver((entries) => {
      if (!entries.length) return;
      chart.applyOptions({width: entries[0].contentRect.width});
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [height, period]); // Add period to dependencies for showTime

  useEffect(() => {
    if(!candleSeriesRef.current) return;

    const convertedToSeconds = ohlcData.map((item) => 
      [Math.floor(item[0] / 1000), item[1], item[2], item[3], item[4]] as OHLCData
    );

    let merged: OHLCData[];
    if(liveOhlcv) {
      const liveTimestamp = liveOhlcv[0];
      const lastHistoricalCandle = convertedToSeconds[convertedToSeconds.length - 1];
      if(lastHistoricalCandle && lastHistoricalCandle[0] === liveTimestamp) {
        merged = [...convertedToSeconds.slice(0, -1), liveOhlcv]
      }
      else {
        merged = [...convertedToSeconds, liveOhlcv];
      }

    }
    else {
      merged = convertedToSeconds;
    }

    merged.sort((a, b) => a[0] - b[0]);

    const converted = convertOHLCData(merged);
    candleSeriesRef.current.setData(converted);
    
    const dataChanged = prevOhlcDataLength.current !== ohlcData.length;
    if(dataChanged || mode === 'historical') {
      chartRef.current?.timeScale().fitContent();
      prevOhlcDataLength.current = ohlcData.length;
    }

  }, [ohlcData, period, liveOhlcv, mode]);
  return (
    <div id="candlestick-chart">
      <div className="chart-header">
        <div className="flex-1">{children}</div>
        <div className="button-group">
          <span className="text-sm mx-2 font-medium text-purple-100/50">Period:</span>
          {PERIOD_BUTTONS.map(({ value, label }) => (
            <button key={value} className={period === value ? 'config-button-active' : 'config-button'} onClick={() => handlePeriodChange(value)} disabled={loading}>{label}</button>
          ))}
        </div>
        {liveInterval && (
          <div className="button-group">
            <span className="text-sm mx-2 font-medium text-purple-100/50">Update Frequency</span>
            {LIVE_INTERVAL_BUTTONS.map(({ value, label }) => (
              <button
              key={value}
              className={liveInterval === value ? 'config-button-active' : 'config-button'} onClick={() => setLiveInterval && setLiveInterval(value)} disabled={loading}>{label}</button>
            ))}
          </div>
        )}
      </div>
      <div ref={chartContainerRef} className="chart" style={{ height }} />
    </div>
  )
}

export default CandlestickChart;