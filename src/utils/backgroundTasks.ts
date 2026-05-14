import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { useSimulationStore } from '../store/useSimulationStore';
import { runSimulation } from '../engine/simulator';

const BACKGROUND_SIM_TASK = 'BACKGROUND_SIM_TASK';

TaskManager.defineTask(BACKGROUND_SIM_TASK, async () => {
  try {
    const store = useSimulationStore.getState();
    
    if (store.running) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    await runSimulation();
    
    const newState = useSimulationStore.getState();
    const results = newState.simResults;
    
    if (results && results.pRise > 0.7) {
      const fuelName = newState.fuel === 'gasoline' ? 'Gasoline' : 'Diesel';
      console.log(`🚨 Price Spike Alert: ${fuelName} is highly likely to rise next week! Consider filling up now.`);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }
    
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('Background task failed', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSim() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SIM_TASK);
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SIM_TASK, {
      minimumInterval: 60 * 60 * 24,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }
}
