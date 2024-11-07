import { useLocation, useNavigate } from "react-router-dom";

export function useQueryParams() {
  const location = useLocation();
  const navigate = useNavigate();

  const getQueryParam = (param : string, defaultValue = null) => {
    const query = new URLSearchParams(location.search);
    const value = query.get(param);

    if (param === 'page' || param === 'limit') {
      const numericValue = Number(value);
      if (!value || isNaN(numericValue) || numericValue <= 0) {
        return param === 'page' ? 1 : 10;
      }
      return numericValue;
    }

    return value || defaultValue;
  };

  const setQueryParam = (param : string, value : string) => {
    const query = new URLSearchParams(location.search);
    if (value) {
      query.set(param, value);
    } else {
      query.delete(param);
    }
    navigate({ search: query.toString() }, { replace: true });
  };

  return { getQueryParam, setQueryParam };
}

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export default useQuery;