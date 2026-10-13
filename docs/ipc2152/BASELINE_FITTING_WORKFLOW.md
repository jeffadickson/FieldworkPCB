# IPC-2152 baseline model fitting

Use a local point-digitization tool to transcribe authorized Figure 5-3 / 5-5 still-air and Figure 5-11 / 5-13 vacuum chart observations. Store actual chart scans, digitized data and fitted coefficients outside the public repo until redistribution rights are clear.

Required CSV fields: `environment,figure,area_sq_mil,rise_c,current_a,split`. Use `train` and `holdout` observations, and fit separate models for still air and vacuum. Initial exploratory model: `I = K * A^alpha * (ΔT)^beta`. Compare absolute/relative errors on reserved chart points. If residuals exceed the defined numerical threshold, use monotonic interpolation rather than overfitting a global power law.

The supplied charts are multiple representations of the same underlying IPC measurements; cross-figure comparisons check digitization but **not independent physical accuracy**. Respect applicability limits and never extrapolate without explicit diagnostics. Copper-plane, multilayer, parallel-trace and other corrections remain pending Appendix A data. Keep IPC-2221, thermal-resistance scenario and IPC-2152-derived methods separate.

**Reference:** IPC-2152, *Standard for Determining Current Carrying Capacity in Printed Board Design* (August 2009), §5, Figures 5-2–5-5 and 5-10–5-14.

A standalone local digitizer plus standard-library Python fit harness is packaged separately for offline use; do not publish source scans by default.
