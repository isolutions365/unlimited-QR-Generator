import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ScanLog } from '../types';
import {
  resolveScanSync,
  lookupIpLocation,
  ResolvedGeoLocation,
  isPrivateOrReservedIp
} from '../lib/geoLookupService';

interface D3WorldHeatmapProps {
  scans: ScanLog[];
  onHoverCountry?: (hovered: { name: string; count: number; code: string } | null) => void;
  hoveredCountryName?: string | null;
}

export default function D3WorldHeatmap({ scans, onHoverCountry, hoveredCountryName }: D3WorldHeatmapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Dynamic asynchronous resolved locations by IP
  const [dynamicIpLocations, setDynamicIpLocations] = useState<Map<string, ResolvedGeoLocation>>(() => new Map());

  // Simplified World GeoJSON Coordinates
  const landmasses: any = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'North America' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-168, 66], [-120, 55], [-120, 30], [-100, 20], [-80, 8], [-73, 10], [-80, 25], [-82, 32], [-70, 45], [-55, 52], [-60, 65], [-80, 70], [-168, 66]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'South America' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-80, 8], [-45, -5], [-35, -7], [-40, -22], [-65, -45], [-72, -53], [-75, -45], [-80, -20], [-80, 8]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Africa' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-17, 32], [10, 32], [32, 30], [51, 11], [46, -25], [34, -34], [18, -34], [10, -5], [-17, 15], [-17, 32]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Eurasia' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-10, 65], [10, 68], [30, 70], [60, 72], [100, 73], [140, 70], [170, 65], [170, 40], [140, 35], [120, 22], [105, 10], [75, 8], [50, 12], [35, 30], [10, 35], [-10, 35], [-10, 50], [-10, 65]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Australia' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [113, -22], [130, -12], [144, -15], [153, -28], [150, -37], [140, -38], [115, -35], [113, -22]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Greenland' },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-60, 75], [-40, 75], [-30, 70], [-45, 60], [-55, 60], [-60, 75]
          ]]
        }
      }
    ]
  };

  // Dynamic background IP lookup for public IPs
  useEffect(() => {
    let isMounted = true;
    const unresolvedIps: string[] = [];

    scans.forEach(s => {
      if (s.ip && !isPrivateOrReservedIp(s.ip) && !dynamicIpLocations.has(s.ip.trim())) {
        unresolvedIps.push(s.ip.trim());
      }
    });

    if (unresolvedIps.length === 0) return;

    // Batch resolve distinct public IPs
    const uniqueIps = Array.from(new Set(unresolvedIps));
    const promises = uniqueIps.map(async ip => {
      const res = await lookupIpLocation(ip);
      return { ip, res };
    });

    Promise.all(promises).then(results => {
      if (!isMounted) return;
      let hasUpdates = false;
      setDynamicIpLocations(prev => {
        const next = new Map(prev);
        results.forEach(({ ip, res }) => {
          if (res && !next.has(ip)) {
            next.set(ip, res);
            hasUpdates = true;
          }
        });
        return hasUpdates ? next : prev;
      });
    });

    return () => {
      isMounted = false;
    };
  }, [scans, dynamicIpLocations]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll('*').remove(); // Clear previous drawing

    const width = 800;
    const height = 400;

    // 1. Create a D3 Projection
    const projection = d3.geoEquirectangular()
      .scale(125)
      .translate([width / 2, height / 2 + 25]);

    // 2. Path generator for geography shapes
    const pathGenerator = d3.geoPath().projection(projection);

    // 3. Draw lat/long graticules grid lines
    const graticule = d3.geoGraticule();
    
    // Draw grid lines
    svgElement.append('path')
      .datum(graticule)
      .attr('class', 'graticule')
      .attr('d', pathGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', '0.5')
      .attr('stroke-dasharray', '3 3')
      .attr('opacity', '0.6');

    // Draw equator/prime meridian
    svgElement.append('path')
      .datum(graticule.outline)
      .attr('class', 'outline')
      .attr('d', pathGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', '1')
      .attr('opacity', '0.4');

    // 4. Draw landmasses
    svgElement.selectAll('.land')
      .data(landmasses.features)
      .enter()
      .append('path')
      .attr('class', 'land')
      .attr('d', pathGenerator as any)
      .attr('fill', '#f1f5f9')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', '1')
      .attr('stroke-linejoin', 'round')
      .style('transition', 'fill 0.3s ease');

    // 5. Dynamic IP & Location Geo-lookup Aggregation
    // Clusters scans by resolved geographic location to eliminate single-country hotspots
    const clusterMap = new Map<string, {
      name: string;
      city: string;
      country: string;
      code: string;
      coords: [number, number];
      count: number;
    }>();

    scans.forEach((scan, index) => {
      // Prioritize live-resolved IP location if available; otherwise use sync multi-tier resolver
      const liveResolved = scan.ip ? dynamicIpLocations.get(scan.ip.trim()) : null;
      const geo = liveResolved || resolveScanSync(scan, index);

      // Key by display name or regional coordinates to group local scans without collapsing entire countries
      const clusterKey = `${geo.displayName}_${geo.coordinates[0].toFixed(1)}_${geo.coordinates[1].toFixed(1)}`;
      
      const existing = clusterMap.get(clusterKey);
      if (existing) {
        existing.count += 1;
      } else {
        clusterMap.set(clusterKey, {
          name: geo.displayName,
          city: geo.city,
          country: geo.country,
          code: geo.countryCode,
          coords: geo.coordinates,
          count: 1
        });
      }
    });

    const clusters = Array.from(clusterMap.values()).filter(c => c.count > 0);
    const maxCount = Math.max(...clusters.map(c => c.count), 1);

    // Format geo data with coordinates
    const geoData = clusters.map(c => {
      const intensity = c.count / maxCount;
      const [projX, projY] = projection(c.coords) || [width / 2, height / 2];
      return {
        name: c.name,
        city: c.city,
        country: c.country,
        count: c.count,
        intensity,
        x: projX,
        y: projY,
        code: c.code
      };
    });

    // Define colors
    const getHeatColors = (intensity: number) => {
      if (intensity > 0.7) {
        return { core: '#ef4444', glow: 'rgba(239, 68, 68, 0.25)', text: '#b91c1c' };
      } else if (intensity > 0.4) {
        return { core: '#f97316', glow: 'rgba(249, 115, 22, 0.25)', text: '#c2410c' };
      } else {
        return { core: '#4f46e5', glow: 'rgba(79, 70, 229, 0.25)', text: '#4338ca' };
      }
    };

    // 6. Draw Hotspots and bind interaction events
    const hotspotGroups = svgElement.selectAll('.hotspot')
      .data(geoData)
      .enter()
      .append('g')
      .attr('class', 'hotspot')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer');

    // Add glowing outer rings with transition
    hotspotGroups.append('circle')
      .attr('class', 'outer-glow')
      .attr('r', d => 10 + d.intensity * 14)
      .attr('fill', d => getHeatColors(d.intensity).glow)
      .style('transition', 'r 0.3s ease, fill 0.3s ease');

    // Add pulsing border rings
    hotspotGroups.append('circle')
      .attr('class', 'pulse-ring')
      .attr('r', d => 6 + d.intensity * 8)
      .attr('fill', 'none')
      .attr('stroke', d => getHeatColors(d.intensity).core)
      .attr('stroke-width', '1.5')
      .attr('opacity', '0.7')
      .style('transform-origin', 'center');

    // Add solid inner core
    hotspotGroups.append('circle')
      .attr('class', 'inner-core')
      .attr('r', d => 4 + d.intensity * 4)
      .attr('fill', d => getHeatColors(d.intensity).core)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', '2')
      .style('transition', 'r 0.2s ease');

    // Add large transparent circles for optimal hover targeting
    hotspotGroups.append('circle')
      .attr('class', 'hover-target')
      .attr('r', 24)
      .attr('fill', 'transparent')
      .on('mouseenter', function (event, d) {
        d3.select(this.parentNode as any).select('.outer-glow')
          .transition()
          .duration(200)
          .attr('r', 26);

        d3.select(this.parentNode as any).select('.inner-core')
          .transition()
          .duration(150)
          .attr('r', 4 + d.intensity * 4 + 4);

        if (onHoverCountry) {
          onHoverCountry({ name: d.name, count: d.count, code: d.code });
        }
      })
      .on('mouseleave', function (event, d) {
        d3.select(this.parentNode as any).select('.outer-glow')
          .transition()
          .duration(200)
          .attr('r', 10 + d.intensity * 14);

        d3.select(this.parentNode as any).select('.inner-core')
          .transition()
          .duration(150)
          .attr('r', 4 + d.intensity * 4);

        if (onHoverCountry) {
          onHoverCountry(null);
        }
      });

    // Handle high-end D3 continuous pulsing effect
    const pulseRings = svgElement.selectAll('.pulse-ring');
    
    function repeatPulse() {
      pulseRings
        .attr('r', (d: any) => 6 + d.intensity * 8)
        .attr('opacity', 0.8)
        .transition()
        .duration(1600)
        .ease(d3.easeLinear)
        .attr('r', (d: any) => 18 + d.intensity * 20)
        .attr('opacity', 0)
        .on('end', repeatPulse);
    }
    repeatPulse();

  }, [scans, dynamicIpLocations, onHoverCountry]);

  // Synchronize state trigger hover outlines from external (e.g. leaderboard selection)
  useEffect(() => {
    if (!svgRef.current) return;
    const svgElement = d3.select(svgRef.current);

    svgElement.selectAll('.land')
      .style('fill', '#f1f5f9');

    if (hoveredCountryName) {
      const matchLower = hoveredCountryName.toLowerCase();
      // Find matching landmass to accent slightly
      svgElement.selectAll('.land')
        .filter((d: any) => d && d.properties && matchLower.includes(d.properties.name.toLowerCase()))
        .style('fill', '#e0e7ff');

      // Accentuate matching hotspots
      svgElement.selectAll('.hotspot')
        .each(function(d: any) {
          const isMatch = d && (
            (d.name && d.name.toLowerCase().includes(matchLower)) ||
            (d.country && d.country.toLowerCase().includes(matchLower)) ||
            (d.code && d.code.toLowerCase() === matchLower)
          );
          if (isMatch) {
            d3.select(this).select('.outer-glow')
              .attr('r', 28)
              .attr('fill', 'rgba(79, 70, 229, 0.4)');
          } else {
            d3.select(this).select('.outer-glow')
              .attr('r', (item: any) => 10 + item.intensity * 14)
              .attr('fill', (item: any) => item.intensity > 0.7 ? 'rgba(239, 68, 68, 0.25)' : item.intensity > 0.4 ? 'rgba(249, 115, 22, 0.25)' : 'rgba(79, 70, 229, 0.25)');
          }
        });
    }
  }, [hoveredCountryName]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 800 400"
      className="w-full h-full relative z-10"
    />
  );
}
