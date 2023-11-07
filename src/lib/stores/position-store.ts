import { derived, get, readonly, writable } from 'svelte/store';

const positionOption: PositionOptions = {
	enableHighAccuracy: true,
	maximumAge: 60 * 1000, // 1 min
	timeout: 20 * 1000 // 20 sec
};

const positionStore = writable<GeolocationPosition | undefined>(undefined, () => {
	//
	return () => stopWatch();
});
const errorStore = writable<GeolocationPositionError | undefined>(undefined);
const watchIdStore = writable(0);
const isWatchingStore = derived(watchIdStore, (id) => id > 0, false);

function successCallback(position: GeolocationPosition) {
	positionStore.set(position);
	errorStore.set(undefined);
}

function errorCallback(positionError: GeolocationPositionError) {
	errorStore.set(positionError);
}

function startWatch() {
	if (get(isWatchingStore)) return;

	if (!window.navigator?.geolocation) {
		// error
	} else {
		const id = navigator.geolocation.watchPosition(successCallback, errorCallback, positionOption);
		watchIdStore.set(id);
	}
}

function stopWatch() {
	const id = get(watchIdStore);
	if (id) {
		navigator.geolocation.clearWatch(id);
	}
}

export const usePositionStore = () => {
	return {
		positionStore: readonly(positionStore),
		errorStore: readonly(errorStore),
		isWatchtingStore: readonly(isWatchingStore),
		startWatch,
		stopWatch
	};
};
