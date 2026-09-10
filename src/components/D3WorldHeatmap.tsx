import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ScanLog } from '../types';

interface D3WorldHeatmapProps {
  scans: ScanLog[];
  onHoverCountry?: (hovered: { name: string; count: number; code: string } | null) => void;
  hoveredCountryName?: string | null;
}

export default function D3WorldHeatmap({ scans, onHoverCountry, hoveredCountryName }: D3WorldHeatmapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Normalize location strings for heatmap coordination mapping
  const normalizeCountry = (loc: string): string => {
    if (!loc) return 'Global';
    const l = loc.trim().toLowerCase();

    // Mapping aliases/names to standard keys
    if (l.includes('united states') || l === 'us' || l === 'usa') return 'United States';
    if (l.includes('united kingdom') || l === 'uk' || l === 'gb' || l.includes('london')) return 'United Kingdom';
    if (l.includes('germany') || l === 'de' || l.includes('berlin')) return 'Germany';
    if (l.includes('france') || l === 'fr' || l.includes('paris')) return 'France';
    if (l.includes('ireland') || l === 'ie' || l.includes('dublin')) return 'Ireland';
    if (l.includes('japan') || l === 'jp' || l.includes('tokyo')) return 'Japan';
    if (l.includes('canada') || l === 'ca' || l.includes('toronto')) return 'Canada';
    if (l.includes('australia') || l === 'au' || l.includes('sydney')) return 'Australia';
    if (l.includes('india') || l === 'in' || l.includes('delhi') || l.includes('mumbai')) return 'India';
    if (l.includes('china') || l === 'cn' || l.includes('beijing')) return 'China';
    if (l.includes('brazil') || l === 'br' || l.includes('rio')) return 'Brazil';
    if (l.includes('south africa') || l === 'za') return 'South Africa';
    if (l.includes('italy') || l === 'it' || l.includes('rome')) return 'Italy';
    if (l.includes('spain') || l === 'es' || l.includes('madrid')) return 'Spain';
    if (l.includes('mexico') || l === 'mx') return 'Mexico';
    if (l.includes('saudi arabia') || l === 'sa' || l.includes('riyadh')) return 'Saudi Arabia';
    if (l.includes('united arab emirates') || l.includes('uae') || l === 'ae' || l.includes('dubai')) return 'United Arab Emirates';
    if (l.includes('egypt') || l === 'eg' || l.includes('cairo')) return 'Egypt';
    if (l.includes('turkey') || l === 'tr' || l.includes('istanbul')) return 'Turkey';
    if (l.includes('pakistan') || l === 'pk' || l.includes('karachi')) return 'Pakistan';
    if (l.includes('bangladesh') || l === 'bd' || l.includes('dhaka')) return 'Bangladesh';
    if (l.includes('indonesia') || l === 'id' || l.includes('jakarta')) return 'Indonesia';
    if (l.includes('russia') || l === 'ru' || l.includes('moscow')) return 'Russia';
    if (l.includes('argentina') || l === 'ar' || l.includes('buenos aires')) return 'Argentina';
    if (l.includes('colombia') || l === 'co' || l.includes('bogota')) return 'Colombia';
    if (l.includes('chile') || l === 'cl' || l.includes('santiago')) return 'Chile';
    if (l.includes('peru') || l === 'pe' || l.includes('lima')) return 'Peru';
    if (l.includes('netherlands') || l === 'nl' || l.includes('amsterdam')) return 'Netherlands';
    if (l.includes('belgium') || l === 'be' || l.includes('brussels')) return 'Belgium';
    if (l.includes('switzerland') || l === 'ch' || l.includes('zurich')) return 'Switzerland';
    if (l.includes('sweden') || l === 'se' || l.includes('stockholm')) return 'Sweden';
    if (l.includes('norway') || l === 'no' || l.includes('oslo')) return 'Norway';
    if (l.includes('singapore') || l === 'sg') return 'Singapore';
    if (l.includes('new zealand') || l === 'nz') return 'New Zealand';
    if (l.includes('south korea') || l === 'kr' || l.includes('seoul')) return 'South Korea';
    if (l.includes('vietnam') || l === 'vn') return 'Vietnam';
    if (l.includes('thailand') || l === 'th' || l.includes('bangkok')) return 'Thailand';
    if (l.includes('malaysia') || l === 'my' || l.includes('kuala lumpur')) return 'Malaysia';
    if (l.includes('nigeria') || l === 'ng' || l.includes('lagos')) return 'Nigeria';
    if (l.includes('kenya') || l === 'ke' || l.includes('nairobi')) return 'Kenya';
    if (l.includes('morocco') || l === 'ma' || l.includes('casablanca')) return 'Morocco';
    if (l.includes('ukraine') || l === 'ua' || l.includes('kyiv')) return 'Ukraine';
    if (l.includes('poland') || l === 'pl' || l.includes('warsaw')) return 'Poland';
    if (l.includes('greece') || l === 'gr' || l.includes('athens')) return 'Greece';

    // Fuzzy check fallback
    const match = Object.keys(countryCoordinates).find(key => key !== 'Global' && l.includes(key.toLowerCase()));
    if (match) return match;

    return 'Global';
  };

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

  // Precise country coordinates for projection mapping
  const countryCoordinates: { [key: string]: { coord: [number, number]; code: string } } = {
    'Canada': { coord: [-106.3468, 56.1304], code: 'CA' },
    'United States': { coord: [-95.7129, 37.0902], code: 'US' },
    'Brazil': { coord: [-51.9253, -14.2350], code: 'BR' },
    'Ireland': { coord: [-8.2439, 53.4129], code: 'IE' },
    'United Kingdom': { coord: [-3.4360, 55.3781], code: 'UK' },
    'France': { coord: [2.2137, 46.2276], code: 'FR' },
    'Germany': { coord: [10.4515, 51.1657], code: 'DE' },
    'South Africa': { coord: [22.9375, -30.5595], code: 'ZA' },
    'India': { coord: [78.9629, 20.5937], code: 'IN' },
    'China': { coord: [104.1954, 35.8617], code: 'CN' },
    'Japan': { coord: [138.2529, 36.2048], code: 'JP' },
    'Australia': { coord: [133.7751, -25.2744], code: 'AU' },
    'Italy': { coord: [12.5674, 41.8719], code: 'IT' },
    'Spain': { coord: [-3.7492, 40.4637], code: 'ES' },
    'Mexico': { coord: [-102.5528, 23.6345], code: 'MX' },
    'Saudi Arabia': { coord: [45.0792, 23.8859], code: 'SA' },
    'United Arab Emirates': { coord: [53.8478, 23.4241], code: 'AE' },
    'Egypt': { coord: [30.8025, 26.8206], code: 'EG' },
    'Turkey': { coord: [35.2433, 38.9637], code: 'TR' },
    'Pakistan': { coord: [69.3451, 30.3753], code: 'PK' },
    'Bangladesh': { coord: [90.3563, 23.6850], code: 'BD' },
    'Indonesia': { coord: [113.9213, -0.7893], code: 'ID' },
    'Russia': { coord: [105.3188, 61.5240], code: 'RU' },
    'Argentina': { coord: [-63.6167, -38.4161], code: 'AR' },
    'Colombia': { coord: [-73.0810, 4.5709], code: 'CO' },
    'Chile': { coord: [-71.5430, -35.6751], code: 'CL' },
    'Peru': { coord: [-75.0152, -9.1900], code: 'PE' },
    'Netherlands': { coord: [5.2913, 52.1326], code: 'NL' },
    'Belgium': { coord: [4.4699, 50.5039], code: 'BE' },
    'Switzerland': { coord: [8.2275, 46.8182], code: 'CH' },
    'Sweden': { coord: [18.6435, 60.1282], code: 'SE' },
    'Norway': { coord: [8.4689, 60.4720], code: 'NO' },
    'Singapore': { coord: [103.8198, 1.3521], code: 'SG' },
    'New Zealand': { coord: [174.8860, -40.9006], code: 'NZ' },
    'South Korea': { coord: [127.7669, 35.9078], code: 'KR' },
    'Vietnam': { coord: [108.2772, 14.0583], code: 'VN' },
    'Thailand': { coord: [100.9925, 15.8700], code: 'TH' },
    'Malaysia': { coord: [101.9758, 4.2105], code: 'MY' },
    'Nigeria': { coord: [8.6753, 9.0820], code: 'NG' },
    'Kenya': { coord: [37.9062, -1.2921], code: 'KE' },
    'Morocco': { coord: [-9.5572, 31.7917], code: 'MA' },
    'Ukraine': { coord: [31.1656, 48.3794], code: 'UA' },
    'Poland': { coord: [19.1451, 51.9194], code: 'PL' },
    'Greece': { coord: [21.8243, 39.0742], code: 'GR' },
    'Global': { coord: [0, 20], code: 'GL' }
  };

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

    // 5. Aggregate geographical scan counts
    const counts: { [key: string]: number } = {};
    scans.forEach(s => {
      const country = normalizeCountry(s.approxLocation);
      counts[country] = (counts[country] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(counts), 1);

    // Format geo data with coordinates
    const geoData = Object.keys(counts).map(name => {
      const info = countryCoordinates[name] || countryCoordinates['Global'];
      const count = counts[name];
      const intensity = count / maxCount;
      const [projX, projY] = projection(info.coord) || [width / 2, height / 2];
      return {
        name,
        count,
        intensity,
        x: projX,
        y: projY,
        code: info.code
      };
    }).filter(d => d.count > 0);

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

  }, [scans, onHoverCountry]);

  // Synchronize state trigger hover outlines from external (e.g. leaderboard selection)
  useEffect(() => {
    if (!svgRef.current) return;
    const svgElement = d3.select(svgRef.current);

    svgElement.selectAll('.land')
      .style('fill', '#f1f5f9');

    if (hoveredCountryName) {
      // Find matching landmass to accent slightly
      svgElement.selectAll('.land')
        .filter((d: any) => d && d.properties && hoveredCountryName.toLowerCase().includes(d.properties.name.toLowerCase()))
        .style('fill', '#e0e7ff');
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
