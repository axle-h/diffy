# Kubernetes Deployment

I use k3s. This might not work otherwise.

```shell
kubectl create namespace diffy
kubectl -n diffy apply -f *
```

TODO address this
`Warning: annotation "kubernetes.io/ingress.class" is deprecated, please use 'spec.ingressClassName' instead`