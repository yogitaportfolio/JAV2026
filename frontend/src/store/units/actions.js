// Units Actions
export const FETCH_UNITS = "FETCH_UNITS"
export const FETCH_UNITS_SUCCESS = "FETCH_UNITS_SUCCESS"
export const FETCH_UNITS_FAIL = "FETCH_UNITS_FAIL"

export const fetchUnits = () => ({
  type: FETCH_UNITS,
})

export const fetchUnitsSuccess = (units) => ({
  type: FETCH_UNITS_SUCCESS,
  payload: units,
})

export const fetchUnitsFail = (error) => ({
  type: FETCH_UNITS_FAIL,
  payload: error,
})
