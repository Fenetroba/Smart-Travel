import { useState } from 'react'
import { useHubs } from '../store/hooks/useHubs'
import { useRoutes } from '../store/hooks/useRoutes'
import { useTransport } from '../store/hooks/useTransport'
import { analyzeWithDelay } from '../lib/routeAnalyzer'
import { getRecommendations } from '../lib/recommendationEngine'
import { nearestHub } from '../lib/geoUtils'
import HeroSection from '../components/traveler/HeroSection'
import LocationInputPanel from '../components/traveler/LocationInputPanel'
import MapView from '../components/traveler/MapView'
import ResultsPanel from '../components/traveler/ResultsPanel'

export default function TravelerPage() {
  const { hubs } = useHubs()
  const { routes } = useRoutes()
  const { transportModes } = useTransport()

  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [geoError, setGeoError] = useState(null)
  const [selectedMode, setSelectedMode] = useState(null)

  async function handleAnalyze() {
    setIsAnalyzing(true)
    setGeoError(null)
    try {
      const result = await analyzeWithDelay(origin, destination, hubs, routes, transportModes)
      result.recommendations = getRecommendations(result.destination)
      setAnalysisResult(result)
      setSelectedMode(result.bestOption.mode.id)
    } catch (err) {
      setGeoError(err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  function handleGeoDetect() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const hub = nearestHub(pos.coords.latitude, pos.coords.longitude, hubs)
        if (hub) setOrigin(hub.name)
      },
      () => setGeoError('Could not detect location')
    )
  }

  async function handleRecommendationClick(name) {
    setDestination(name)
    setIsAnalyzing(true)
    setGeoError(null)
    try {
      const result = await analyzeWithDelay(origin, name, hubs, routes, transportModes)
      result.recommendations = getRecommendations(result.destination)
      setAnalysisResult(result)
      setSelectedMode(result.bestOption.mode.id)
    } catch (err) {
      setGeoError(err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <HeroSection />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-[75vh] md:pb-6">
        <LocationInputPanel
          origin={origin}
          destination={destination}
          onOriginChange={setOrigin}
          onDestinationChange={setDestination}
          onAnalyze={handleAnalyze}
          onGeoDetect={handleGeoDetect}
          isAnalyzing={isAnalyzing}
          geoError={geoError}
          hubs={hubs}
        />
        <MapView
          hubs={hubs}
          analysisResult={analysisResult}
          selectedMode={selectedMode}
          isAnalyzing={isAnalyzing}
        />
        <ResultsPanel
          result={analysisResult}
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          onRecommendationClick={handleRecommendationClick}
        />
      </div>
    </div>
  )
}
