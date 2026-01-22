
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, ZoomControl, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Plus, Navigation, AlertTriangle, X, Map as MapIcon, List, Clock, LocateFixed, Info, BarChart3, Fingerprint } from 'lucide-react';
import { HelpRequest, HelpType, UserLocation, HelpStatus } from './types';
import { STATUS_COLORS, VIETNAMESE_LABELS, HELP_TYPES } from './constants';
import { subscribeToRequests, submitHelpRequest, updateRequestStatus, updateHelpRequest } from './services/firebase';
import { getUserIdentity } from './utils/identity';
import HelpForm from './components/HelpForm';
import ProofForm from './components/ProofForm';
import RequestList from './components/RequestList';
import RequestDetail from './components/RequestDetail';
import FilterBar from './components/FilterBar';
import AboutModal from './components/AboutModal';
import StatsModal from './components/StatsModal';
import { formatRelativeTime, formatFullDateTime } from './utils/time';

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const MapEvents = ({ onMapClick, onManualInteraction }: { onMapClick: (lat: number, lng: number) => void, onManualInteraction: () => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
    dragstart() {
      onManualInteraction();
    },
    mousedown() {
      onManualInteraction();
    }
  });
  return null;
};

const MapController: React.FC<{ 
  center?: UserLocation; 
  bounds?: L.LatLngBoundsExpression; 
  focusTarget?: UserLocation | null;
  isFollowingUser: boolean;
}> = ({ center, bounds, focusTarget, isFollowingUser }) => {
  const map = useMap();
  
  useEffect(() => {
    if (focusTarget) {
      map.flyTo([focusTarget.lat, focusTarget.lng], 16, { duration: 1.5 });
    } else if (bounds) {
      map.fitBounds(bounds, { padding: [100, 100], maxZoom: 16 });
    } else if (center && isFollowingUser) {
      map.flyTo([center.lat, center.lng], map.getZoom(), { duration: 1 });
    }
  }, [center, bounds, focusTarget, isFollowingUser, map]);
  
  return null;
};

interface RouteData {
  coordinates: [number, number][];
  distance: number; 
  duration: number; 
  targetId: string;
}

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | null>(null);
  const [activeRoute, setActiveRoute] = useState<RouteData | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<HelpType | 'all' | 'mine'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<HelpRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<{ message: string; type: string } | null>(null);
  const [proofRequest, setProofRequest] = useState<HelpRequest | null>(null);
  const [focusTarget, setFocusTarget] = useState<UserLocation | null>(null);
  const [detailRequest, setDetailRequest] = useState<HelpRequest | null>(null);

  const geoOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  };

  const updateLocation = useCallback((position: GeolocationPosition) => {
    setUserLocation({ 
      lat: position.coords.latitude, 
      lng: position.coords.longitude 
    });
    setError(null);
  }, []);

  useEffect(() => {
    getUserIdentity().then(id => setUserId(id));
    const unsubscribe = subscribeToRequests(
      (data) => setRequests(data),
      (err) => setError({ message: "Lỗi kết nối máy chủ. Vui lòng kiểm tra mạng.", type: 'general' })
    );

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(updateLocation, 
        (err) => setError({ message: "Vui lòng bật định vị GPS để xác định vị trí của bạn.", type: 'gps' }),
        geoOptions
      );
      
      const watchId = navigator.geolocation.watchPosition(updateLocation, null, geoOptions);
      return () => {
        unsubscribe();
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      setError({ message: "Trình duyệt không hỗ trợ định vị địa lý.", type: 'gps' });
    }
    return () => unsubscribe();
  }, [updateLocation]);

  const completionPercentage = useMemo(() => {
    if (requests.length === 0) return 0;
    const completed = requests.filter(r => r.status === 'completed').length;
    return Math.round((completed / requests.length) * 100);
  }, [requests]);

  const handleLocateUser = () => {
    setIsFollowingUser(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateLocation(pos);
          setFocusTarget({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setTimeout(() => setFocusTarget(null), 2000);
        },
        (err) => alert("Không thể lấy vị trí. Hãy kiểm tra cài đặt GPS của thiết bị."),
        geoOptions
      );
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (activeRoute) return; 
    if (!userLocation) {
      alert("Hệ thống đang xác định vị trí của bạn, vui lòng đợi trong giây lát.");
      return;
    }
    const distance = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
    if (distance > 5) {
      alert(`Vị trí đã chọn quá xa (${distance.toFixed(1)}km). Bạn chỉ có thể báo cứu hộ trong phạm vi 5km quanh bạn.`);
      return;
    }
    setSelectedLocation({ lat, lng });
    setEditingRequest(null);
    setIsFormOpen(true);
  };

  const handleManualInteraction = () => {
    if (isFollowingUser) {
      setIsFollowingUser(false);
    }
  };

  const handleShowRoute = async (req: HelpRequest) => {
    if (!userLocation) return;
    setIsFollowingUser(false);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${req.location.lng},${req.location.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0];
        setActiveRoute({
          coordinates: route.geometry.coordinates.map((c: number[]) => [c[1], c[0]]),
          distance: route.distance,
          duration: route.duration,
          targetId: req.id
        });
        setViewMode('map');
        setDetailRequest(null);
      }
    } catch (err) { 
      console.error(err);
      alert("Không thể tìm thấy lộ trình di chuyển.");
    }
  };

  const handleSubmitRequest = async (type: HelpType, requesterName: string, description: string, contact: string, imageUrl: string) => {
    const finalLocation = editingRequest ? editingRequest.location : selectedLocation;
    if (!finalLocation || !userId) return;
    setIsSubmitting(true);
    try {
      if (editingRequest) {
        await updateHelpRequest(editingRequest.id, { type, requesterName, description, contact, imageUrl });
        setEditingRequest(null);
      } else {
        await submitHelpRequest(finalLocation.lat, finalLocation.lng, type, requesterName, description, contact, userId, imageUrl);
      }
      setIsFormOpen(false);
      setSelectedLocation(null);
    } catch (err) { 
      alert("Gửi yêu cầu thất bại. Vui lòng thử lại."); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      let passes = activeFilter === 'mine' ? r.createdBy === userId : (activeFilter === 'all' || r.type === activeFilter);
      if (!passes) return false;
      if (r.createdBy === userId) return true;
      if (userLocation) {
        return calculateDistance(userLocation.lat, userLocation.lng, r.location.lat, r.location.lng) <= 5;
      }
      return true; 
    });
  }, [requests, activeFilter, userId, userLocation]);

  const handleFocusOnMap = (req: HelpRequest) => {
    setIsFollowingUser(false);
    setFocusTarget(req.location);
    setViewMode('map');
    setDetailRequest(req); 
    setTimeout(() => setFocusTarget(null), 2000);
  };

  const handleCompleteHelp = (req: HelpRequest) => {
    setProofRequest(req);
    setDetailRequest(null);
  };

  const handleProofSubmit = async (data: { helperName: string; helperContact: string; proofImage: string }) => {
    if (!proofRequest) return;
    setIsSubmitting(true);
    try {
      await updateRequestStatus(proofRequest.id, 'completed', {
        helperName: data.helperName,
        helperContact: data.helperContact,
        proofImageUrl: data.proofImage,
        assistedBy: userId
      });
      setProofRequest(null);
      alert("Cảm ơn bạn đã hỗ trợ cộng đồng!");
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái cứu trợ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const createMarkerIcon = (status: HelpStatus, isMine: boolean, index: number) => {
    const color = STATUS_COLORS[status];
    const isWaiting = status === 'waiting';
    
    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          ${isWaiting ? `<div class="absolute w-12 h-12 rounded-full animate-ping opacity-30" style="background-color: ${color}"></div>` : ''}
          <div 
            style="background-color: ${color}" 
            class="w-10 h-10 rounded-full border-[3.5px] border-white shadow-[0_10px_25px_rgba(0,0,0,0.25)] flex items-center justify-center text-white font-black text-[13px] transition-all transform hover:scale-125 z-10"
          >
            ${index + 1}
          </div>
          ${isMine ? `<div class="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-blue-600 rounded-full border-2 border-white z-20 shadow-md"></div>` : ''}
        </div>`,
      className: '', 
      iconSize: [44, 44], 
      iconAnchor: [22, 22], 
      popupAnchor: [0, -22]
    });
  };

  return (
    <div className="relative w-full h-screen bg-slate-50 overflow-hidden font-sans">
      {/* HUD: Thanh Lọc Phía Trên */}
      {viewMode === 'map' && (
        <FilterBar 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter} 
          completionPercentage={completionPercentage}
          onStatsClick={() => setIsStatsOpen(true)}
        />
      )}
      
      {/* HUD: Thông Báo Lỗi */}
      {error && !activeRoute && (
        <div className="fixed top-24 left-4 right-4 z-[550] pointer-events-none">
          <div className="bg-amber-50/95 backdrop-blur-md border border-amber-200 p-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top duration-300 max-w-sm mx-auto">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="text-[11px] font-black text-amber-800 uppercase tracking-tight">{error.message}</span>
          </div>
        </div>
      )}

      {/* Nút Thông Tin */}
      <div className="fixed top-20 right-4 z-[500] pt-4 pointer-events-none">
        <button 
          onClick={() => setIsAboutOpen(true)}
          className="w-12 h-12 bg-white/95 backdrop-blur-xl border border-white/60 rounded-full flex items-center justify-center text-slate-700 shadow-xl pointer-events-auto active:scale-90 transition-all hover:bg-slate-50"
        >
          <Info className="w-6 h-6" />
        </button>
      </div>

      {/* Lớp Bản Đồ */}
      <div className={`w-full h-full transition-opacity duration-500 ${viewMode === 'list' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <MapContainer center={[10.762622, 106.660172]} zoom={15} zoomControl={false} className="w-full h-full">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          <ZoomControl position="bottomleft" />
          <MapController 
            center={userLocation || undefined} 
            bounds={activeRoute ? L.latLngBounds(activeRoute.coordinates) : undefined} 
            focusTarget={focusTarget}
            isFollowingUser={isFollowingUser}
          />
          <MapEvents onMapClick={handleMapClick} onManualInteraction={handleManualInteraction} />

          {activeRoute && <Polyline positions={activeRoute.coordinates} pathOptions={{ color: '#3b82f6', weight: 6, lineCap: 'round', opacity: 0.8 }} />}

          {selectedLocation && !activeRoute && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={L.divIcon({ 
              html: `<div class="relative flex flex-col items-center">
                <div class="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black mb-1 shadow-lg border-2 border-white whitespace-nowrap">Vị trí đã chọn</div>
                <div class="w-6 h-6 bg-red-600 rounded-full border-[4px] border-white animate-pulse shadow-2xl"></div>
              </div>`, className: '', iconSize: [100, 40], iconAnchor: [50, 40] 
            })} />
          )}

          {userLocation && (
            <>
              <Circle 
                center={[userLocation.lat, userLocation.lng]} 
                radius={5000} 
                pathOptions={{ 
                  color: '#3b82f6', 
                  fillColor: '#3b82f6', 
                  fillOpacity: 0.05, 
                  weight: 1,
                  dashArray: '5, 10'
                }} 
              />
              <Marker position={[userLocation.lat, userLocation.lng]} icon={L.divIcon({ 
                html: `<div class="relative flex items-center justify-center">
                  <div class="absolute w-8 h-8 bg-blue-500/20 rounded-full ${isFollowingUser ? 'animate-ping' : ''}"></div>
                  <div class="w-5 h-5 bg-blue-600 rounded-full border-[4px] border-white shadow-xl ring-4 ring-blue-500/20 z-10 ${isFollowingUser ? 'scale-110' : 'scale-100'}"></div>
                </div>`, 
                className: '', iconSize: [32, 32] 
              })} />
            </>
          )}

          {filteredRequests.map((req, index) => (
            <Marker 
              key={req.id} 
              position={[req.location.lat, req.location.lng]} 
              icon={createMarkerIcon(req.status, req.createdBy === userId, index)}
              eventHandlers={{
                click: () => {
                  setDetailRequest(req);
                  setIsFollowingUser(false);
                }
              }}
            >
              <Popup className="custom-popup">
                <div className="text-center py-1">
                  <div className="flex items-center justify-center gap-1.5 mb-1 opacity-60">
                    <Fingerprint className="w-2.5 h-2.5" />
                    <span className="text-[8px] font-mono font-bold tracking-tighter">ID: {req.id.substring(0, 8)}...</span>
                  </div>
                  <p className="text-[9px] font-black uppercase text-slate-400">Tin số ${index + 1} - Chạm để xem</p>
                  <p className="text-sm font-black text-slate-900 leading-none mt-1">{HELP_TYPES.find(t => t.type === req.type)?.label}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Lớp Danh Sách */}
      {viewMode === 'list' && (
        <div className="fixed inset-0 z-[400] bg-slate-50 overflow-y-auto animate-in fade-in slide-in-from-right duration-300">
           <RequestList 
              requests={filteredRequests} 
              userLocation={userLocation} 
              onShowOnMap={handleFocusOnMap} 
              onNavigate={handleShowRoute}
              currentUserId={userId}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
           />
        </div>
      )}

      {/* THANH ĐIỀU HƯỚNG DƯỚI CỐ ĐỊNH */}
      <div className="fixed bottom-0 left-0 right-0 z-[1000] pb-safe px-6 pointer-events-none">
        <div className="max-w-md mx-auto w-full flex flex-col items-center gap-5 pb-8">
          {activeRoute ? (
             <div className="w-full bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white p-6 flex items-center justify-between pointer-events-auto animate-in slide-in-from-bottom-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                    <Navigation className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Đang chỉ đường</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-slate-900">{(activeRoute.distance / 1000).toFixed(1)}km</span>
                      <span className="text-blue-600 font-bold text-lg">• ~{Math.ceil(activeRoute.duration / 60)}p</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => { setActiveRoute(null); setIsFollowingUser(true); }} className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all active:scale-90">
                  <X className="w-6 h-6" />
                </button>
             </div>
          ) : (
            <div className="flex flex-col items-end w-full gap-5">
              <button 
                onClick={handleLocateUser}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl border transition-all pointer-events-auto active:scale-90 ${
                  isFollowingUser 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-blue-200' 
                  : 'bg-white text-blue-600 border-slate-100'
                }`}
              >
                <LocateFixed className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 pointer-events-auto">
                <button 
                  onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                  className="w-16 h-16 bg-white border border-slate-200 text-slate-800 rounded-full flex items-center justify-center shadow-xl hover:bg-slate-50 active:scale-90 transition-all ring-4 ring-slate-100"
                >
                  {viewMode === 'map' ? <List className="w-7 h-7" /> : <MapIcon className="w-7 h-7" />}
                </button>

                <button 
                  onClick={() => { setSelectedLocation(userLocation); setEditingRequest(null); setIsFormOpen(true); }} 
                  className="group flex items-center gap-4 bg-red-600 text-white pl-6 pr-9 py-5 rounded-[2.5rem] shadow-[0_24px_50px_rgba(220,38,38,0.45)] hover:bg-red-700 active:scale-95 transition-all ring-8 ring-red-600/10"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
                    <Plus className="w-7 h-7 stroke-[3px]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase opacity-80 tracking-widest leading-none mb-1">Cần hỗ trợ?</p>
                    <span className="text-base font-black uppercase tracking-tight leading-none">Gửi cứu trợ</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <HelpForm 
        isOpen={isFormOpen} 
        onClose={() => { setIsFormOpen(false); setEditingRequest(null); setSelectedLocation(null); }} 
        onSubmit={handleSubmitRequest} 
        isSubmitting={isSubmitting} 
        editData={editingRequest} 
      />
      
      <ProofForm 
        isOpen={!!proofRequest} 
        onClose={() => setProofRequest(null)} 
        onSubmit={handleProofSubmit} 
        isSubmitting={isSubmitting} 
      />

      {detailRequest && (
        <RequestDetail 
          request={detailRequest} 
          onClose={() => setDetailRequest(null)}
          onNavigate={() => handleShowRoute(detailRequest)}
          onComplete={() => handleCompleteHelp(detailRequest)}
          currentUserId={userId}
        />
      )}

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} requests={requests} />

      <style>{`
        .custom-popup .leaflet-popup-content-wrapper { border-radius: 16px; padding: 6px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border: 1px solid rgba(0,0,0,0.05); background: white; }
        .custom-popup .leaflet-popup-tip { background: white; }
        .leaflet-container { font-family: inherit; }
      `}</style>
    </div>
  );
};

export default App;
