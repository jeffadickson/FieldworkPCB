# Brooks–Adam conductor-heating model reference

Source: Douglas G. Brooks with Dr. Johannes Adam, *Trace Currents and Temperatures Revisited*, April 2015 (July 2015 edit), [PDF](https://www.mathscinotes.com/wp-content/uploads/2016/06/pcbtempr.pdf).

Equation 3-2, Table 3-1 and Appendix 6 specify a fit of the form **ΔT = K I^a W^b t^c**. Width and finished copper thickness are both **mils** (1 mil = 25.4 µm); current is amperes and ΔT is °C. Convert input SI dimensions before using fitted coefficients.

| Fit | K | a | b | c | Original location |
| --- | ---: | ---: | ---: | ---: | --- |
| External still air | 215.3 | 2 | -1.15 | -1 | Eq. 3-2 |
| Internal 1 oz | 200 | 1.9 | -1.10 | -1.52 | Table 3-1 |
| Internal 2 oz | 300.3 | 2 | -1.15 | -1.52 | Appendix 6 |
| Vacuum 2 oz | 480 | 1.9 | -1.10 | -1.52 | Appendix 6 |
| Vacuum 3 oz | 460 | 1.95 | -1.15 | -1.52 | Appendix 6 |

The paper contains additional variable-coefficient fits (0.5-oz internal and vacuum, 3-oz internal); these are not offered here because their coefficients depend on trace width. The Table 3-1 vacuum thickness exponent appears without the minus sign in some text renderings; **Appendix 6** shows the negative exponent, used here.

These are published curve fits to IPC-2152-based results, **not direct IPC-2152 charts**, and not qualified for arbitrary board geometry. Planes, stackup, substrate thermal conductivity, convection, copper resistivity, and nearby conductors change heating. Real board or independent thermal-solver validation is outstanding. Do not copy the proprietary IPC charts into this repository.

Numerical tests: published 100-mil, 2-oz, 10-A external example approximately 39°C; forward/inverse identities; invalid geometries. Measured hardware, live Saturn, and independent source-chart comparisons remain outstanding.
