#!/usr/bin/env python3
"""Exploratory power law fit for authorized IPC-2152 chart observations."""
import csv, math, json, sys

def solve3(a, b):
    q = [list(row)+[z] for row,z in zip(a,b)]
    for col in range(3):
        pos=max(range(col,3), key=lambda j:abs(q[j][col]))
        q[col],q[pos]=q[pos],q[col]
        if abs(q[col][col])<1e-12:raise ValueError("insufficiently varied observations")
        p=q[col][col];q[col]=[v/p for v in q[col]]
        for k in range(3):
            if k!=col:
                p=q[k][col];q[k]=[u-p*v for u,v in zip(q[k],q[col])]
    return [q[i][-1] for i in range(3)]

def fit(rows):
    if len(rows)<4: raise ValueError("need at least four points")
    x=[[1,math.log(float(r["area_sq_mil"])),math.log(float(r["rise_c"]))] for r in rows]
    y=[math.log(float(r["current_a"])) for r in rows]
    if not all(math.isfinite(z) for a in x for z in a) or not all(math.isfinite(v) for v in y):
        raise ValueError("invalid values")
    g=[[sum(a[i]*a[j] for a in x) for j in range(3)] for i in range(3)]
    h=[sum(a[i]*v for a,v in zip(x,y)) for i in range(3)]
    z=solve3(g,h)
    return {"K":math.exp(z[0]),"alpha":z[1],"beta":z[2]}

def evaluate(rows,model):
    if not rows: raise ValueError("holdout data required")
    errors=[]
    for r in rows:
        p=model["K"]*float(r["area_sq_mil"])**model["alpha"]*float(r["rise_c"])**model["beta"]
        errors.append(abs(p/float(r["current_a"])-1)*100)
    return {"count":len(rows),"mape_percent":sum(errors)/len(errors),"max_relative_error_percent":max(errors)}

def run(path):
    with open(path,newline="",encoding="utf-8") as f: rows=list(csv.DictReader(f))
    result={}
    for env in ("still_air","vacuum"):
        selected=[r for r in rows if r["environment"]==env]
        if not selected:continue
        for r in selected:
            for key in ("area_sq_mil","rise_c","current_a"):
                v=float(r[key])
                if not math.isfinite(v) or v<=0:raise ValueError("all numerical values must be finite and positive")
        training=[r for r in selected if r["split"]=="train"]
        holdout=[r for r in selected if r["split"]=="holdout"]
        model=fit(training)
        result[env]={"model":model,"training":evaluate(training,model),"holdout":evaluate(holdout,model),
                     "status":"exploratory chart fit only, not validated against physical measurements"}
    if not result:raise ValueError("no supported environments")
    return result

if __name__=="__main__":
    if len(sys.argv)!=2:raise SystemExit("usage: python tools/ipc2152/fit.py observations.csv")
    print(json.dumps(run(sys.argv[1]),indent=2))
