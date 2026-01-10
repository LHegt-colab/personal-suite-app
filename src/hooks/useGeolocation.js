import { useState } from 'react'

function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function reverseGeocode(latitude, longitude) {
    try {
      // Using OpenStreetMap's Nominatim API for reverse geocoding (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'nl',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Kon locatie naam niet ophalen')
      }

      const data = await response.json()

      // Extract a readable location name
      const { address } = data
      let locationName = ''

      if (address.road) {
        locationName = address.road
        if (address.house_number) {
          locationName += ' ' + address.house_number
        }
      }

      if (address.city || address.town || address.village) {
        const place = address.city || address.town || address.village
        locationName = locationName ? `${locationName}, ${place}` : place
      }

      return locationName || data.display_name
    } catch (err) {
      console.warn('Reverse geocoding failed:', err)
      return null
    }
  }

  async function getLocation() {
    if (!navigator.geolocation) {
      setError('Je browser ondersteunt geen GPS locatie.')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        // Get location name from coordinates
        const locationName = await reverseGeocode(latitude, longitude)

        setLocation({
          latitude,
          longitude,
          locationName,
        })
        setLoading(false)
      },
      (err) => {
        let errorMessage = 'Kon je locatie niet ophalen.'

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Je hebt toestemming geweigerd. Sta locatietoegang toe in je browser.'
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Locatie informatie is niet beschikbaar.'
            break
          case err.TIMEOUT:
            errorMessage = 'Het ophalen van je locatie duurde te lang.'
            break
        }

        setError(errorMessage)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  return {
    location,
    loading,
    error,
    getLocation,
  }
}

export default useGeolocation
