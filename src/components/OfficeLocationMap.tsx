import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { ExternalLink, MapPin, Navigation, Search } from 'lucide-react';
import { BRAND_INFO, CHENNAI_SERVICE_ZONES } from '../data/briicksData';

interface ResolvedLocation {
  title: string;
  address: string;
  note: string;
  position: { lat: number; lng: number };
  mapsUri?: string;
}

interface OfficeLocationMapProps {
  onSelectLocationForQuote: (locationSummary: string) => void;
}

const DEFAULT_CHENNAI_VIEW = {
  center: { lat: 13.0843, lng: 80.2194 },
  zoom: 13,
};

function InteractiveChennaiMapCanvas({
  onSelectLocationForQuote,
}: OfficeLocationMapProps) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const loadingStatus = useApiLoadingStatus();
  const [markerRef, markerInstance] = useAdvancedMarkerRef();

  const [selectedZoneId, setSelectedZoneId] = useState<string>('office');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(true);
  const [activeLocation, setActiveLocation] = useState<ResolvedLocation | null>(null);

  const resolvePlaceByText = useCallback(
    async (queryText: string, fallbackTitle: string, note: string) => {
      if (!placesLib) return;
      setSearching(true);
      setLookupError(null);

      try {
        const { places } = await placesLib.Place.searchByText({
          textQuery: queryText,
          fields: ['displayName', 'formattedAddress', 'location', 'googleMapsURI'],
          maxResultCount: 1,
          region: 'IN',
        });

        const match = places?.[0];
        if (!match?.location) {
          setLookupError(`No exact map pin found for "${queryText}". Try another Chennai locality.`);
          return;
        }

        const nextPos = {
          lat: match.location.lat(),
          lng: match.location.lng(),
        };

        setActiveLocation({
          title: match.displayName || fallbackTitle,
          address: match.formattedAddress || queryText,
          note,
          position: nextPos,
          mapsUri: match.googleMapsURI ?? undefined,
        });
        setInfoOpen(true);

        if (map) {
          map.panTo(nextPos);
          map.setZoom(15);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unable to look up location.';
        if (/quota|RESOURCE_EXHAUSTED|OVER_QUERY_LIMIT|429/i.test(msg)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        setLookupError(msg);
      } finally {
        setSearching(false);
      }
    },
    [placesLib, map]
  );

  // Resolve Briicks Properties office coordinates via Places API once Places library loads
  useEffect(() => {
    if (!placesLib || activeLocation) return;
    const hq = CHENNAI_SERVICE_ZONES[0];
    void resolvePlaceByText(hq.searchQuery, BRAND_INFO.name, hq.serviceNote);
  }, [placesLib, activeLocation, resolvePlaceByText]);

  const handleZoneClick = (zone: (typeof CHENNAI_SERVICE_ZONES)[number]) => {
    setSelectedZoneId(zone.id);
    void resolvePlaceByText(
      zone.searchQuery,
      zone.id === 'office' ? BRAND_INFO.name : `${zone.label} Service Zone`,
      zone.serviceNote
    );
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setSelectedZoneId('custom');
    const queryWithCity = /chennai|tamil nadu/i.test(trimmed)
      ? trimmed
      : `${trimmed}, Chennai, Tamil Nadu`;
    void resolvePlaceByText(
      queryWithCity,
      `Plot Search: ${trimmed}`,
      'Site Feasibility & Turnkey Construction Available'
    );
  };

  if (
    loadingStatus === APILoadingStatus.FAILED ||
    loadingStatus === APILoadingStatus.AUTH_FAILURE
  ) {
    return (
      <div className="rounded-2xl border border-[#E6E4EB] bg-[#F7F7F9] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <p className="font-display font-bold text-base text-[#26232A]">
            Briicks Properties — Anna Nagar East HQ
          </p>
          <p className="text-sm text-[#26232A]/75">{BRAND_INFO.address}</p>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            BRAND_INFO.address
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#26232A] hover:bg-[#D43F17] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          <Navigation className="w-4 h-4" aria-hidden="true" />
          <span>Open in Google Maps</span>
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E6E4EB] bg-white overflow-hidden">
      {/* Top Toolbar: Chennai Locality Zones & Plot Lookup */}
      <div className="p-3.5 sm:p-5 bg-[#F7F7F9] border-b border-[#E6E4EB] flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-nowrap lg:flex-wrap overflow-x-auto no-scrollbar items-center gap-2 pb-0.5 lg:pb-0">
          {CHENNAI_SERVICE_ZONES.map((zone) => {
            const active = selectedZoneId === zone.id;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => handleZoneClick(zone)}
                className={`min-h-[40px] px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#26232A] text-white border-[#26232A]'
                    : 'bg-white text-[#26232A]/80 border-[#E6E4EB] hover:border-[#D43F17]'
                }`}
              >
                {zone.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full lg:w-auto">
          <label htmlFor="map-locality-search" className="sr-only">
            Search your Chennai plot locality
          </label>
          <div className="relative flex-1 lg:w-80">
            <Search
              className="w-4 h-4 text-[#26232A]/45 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="map-locality-search"
              type="text"
              placeholder="Search Chennai area (e.g. Velachery)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[44px] pl-9 pr-3 py-2 text-base sm:text-sm bg-white border border-[#E6E4EB] rounded-lg focus:outline-none focus:border-[#D43F17]"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#D43F17] hover:bg-[#B83210] disabled:opacity-60 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {searching ? 'Locating...' : 'Pin Area'}
          </button>
        </form>
      </div>

      {lookupError && (
        <div
          role="alert"
          className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-900"
        >
          {lookupError}
        </div>
      )}

      {/* Interactive Google Map Canvas (explicit height prevents collapse) */}
      <div className="relative w-full h-[300px] sm:h-[380px] lg:h-[420px] bg-[#E6E4EB]">
        <GoogleMap
          mapId="DEMO_MAP_ID"
          defaultCenter={DEFAULT_CHENNAI_VIEW.center}
          defaultZoom={DEFAULT_CHENNAI_VIEW.zoom}
          gestureHandling="cooperative"
          streetViewControl={false}
          mapTypeControl={false}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          {activeLocation && (
            <AdvancedMarker
              ref={markerRef}
              position={activeLocation.position}
              onClick={() => setInfoOpen(true)}
              title={activeLocation.title}
            >
              <Pin background="#F05228" borderColor="#19171C" glyphColor="#FFFFFF" scale={1.15} />
            </AdvancedMarker>
          )}

          {infoOpen && activeLocation && markerInstance && (
            <InfoWindow
              anchor={markerInstance}
              maxWidth={290}
              onCloseClick={() => setInfoOpen(false)}
            >
              <div className="p-1 space-y-2 text-[#26232A] font-sans">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#D43F17]">
                    {activeLocation.note}
                  </p>
                  <h4 className="font-display font-bold text-sm text-[#26232A] mt-0.5">
                    {activeLocation.title}
                  </h4>
                  <p className="text-xs text-[#26232A]/75 mt-1 leading-relaxed">
                    {activeLocation.address}
                  </p>
                </div>

                <div className="pt-1.5 border-t border-[#E6E4EB] flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      onSelectLocationForQuote(
                        `Plot/Site Inquiry near: ${activeLocation.address}`
                      )
                    }
                    className="text-xs font-semibold text-[#D43F17] hover:text-[#B83210] underline cursor-pointer"
                  >
                    Request Site Visit Here
                  </button>

                  {activeLocation.mapsUri && (
                    <a
                      href={activeLocation.mapsUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#26232A]/80 hover:text-[#26232A]"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}

export function OfficeLocationMap({ onSelectLocationForQuote }: OfficeLocationMapProps) {
  const [runtimeKey, setRuntimeKey] = useState<string>(
    () => (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ?? ''
  );
  const [keyChecked, setKeyChecked] = useState<boolean>(() =>
    Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
  );

  useEffect(() => {
    if (runtimeKey) {
      setKeyChecked(true);
      return;
    }

    let cancelled = false;
    fetch('/api/maps-config')
      .then((res) => (res.ok ? res.json() : { apiKey: '' }))
      .then((data: { apiKey?: string }) => {
        if (!cancelled) {
          setRuntimeKey(data.apiKey ?? '');
          setKeyChecked(true);
        }
      })
      .catch(() => {
        if (!cancelled) setKeyChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [runtimeKey]);

  return (
    <div id="location-map" data-testid="office-map-section" className="mt-14 pt-12 border-t border-[#E6E4EB]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#D43F17]">
            Studio &amp; Chennai Coverage Map
          </p>
          <h3 className="mt-2 font-display font-bold text-2xl sm:text-3xl text-[#26232A] tracking-tight">
            Visit Our Anna Nagar East Office or Pin Your Plot
          </h3>
        </div>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            BRAND_INFO.address
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#26232A] hover:text-[#D43F17] transition-colors whitespace-nowrap shrink-0"
        >
          <MapPin className="w-4 h-4 text-[#D43F17]" aria-hidden="true" />
          <span>Get Driving Directions</span>
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
      </div>

      {!keyChecked ? (
        <div className="h-[380px] rounded-2xl border border-[#E6E4EB] bg-[#F7F7F9] flex items-center justify-center text-sm text-[#26232A]/65">
          Loading interactive Chennai map...
        </div>
      ) : !runtimeKey ? (
        <div className="rounded-2xl border border-[#E6E4EB] bg-[#F7F7F9] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <p className="font-display font-bold text-base text-[#26232A]">
              Briicks Properties — Anna Nagar East HQ
            </p>
            <p className="text-sm text-[#26232A]/75">{BRAND_INFO.address}</p>
            <p className="text-xs text-[#26232A]/60">
              Interactive map activates when a Google Maps API key is configured.
            </p>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              BRAND_INFO.address
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#26232A] hover:bg-[#D43F17] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Navigation className="w-4 h-4" aria-hidden="true" />
            <span>Open in Google Maps</span>
          </a>
        </div>
      ) : (
        <APIProvider apiKey={runtimeKey} libraries={['places', 'marker']} language="en" region="IN">
          <InteractiveChennaiMapCanvas onSelectLocationForQuote={onSelectLocationForQuote} />
        </APIProvider>
      )}
    </div>
  );
}
